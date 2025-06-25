import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_sound/flutter_sound.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:udp/udp.dart';

void main() {
  runApp(const WalkieTalkieApp());
}

class WalkieTalkieApp extends StatelessWidget {
  const WalkieTalkieApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: HomeScreen(),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  HomeScreenState createState() => HomeScreenState();
}

class HomeScreenState extends State<HomeScreen> {
  final FlutterSoundRecorder _recorder = FlutterSoundRecorder();
  late UDP _udp;
  bool _isRecording = false;
  TextEditingController ipController = TextEditingController(text:'192.168.0.102'); // IP destino
  int port = 5000;

  @override
  void initState() {
    super.initState();
    _init();
    _startUDP();
  }

  Future<void> _init() async {
    if (await Permission.microphone.request().isGranted) {
      await _recorder.openRecorder();
    }
  }

  Future<void> _startUDP() async {
    _udp = await UDP.bind(Endpoint.any(port: port));
    // Por ahora no estamos escuchando mensajes.
  }

  Future<void> _startRecording() async {
    await _recorder.startRecorder(toFile:'foo.aac'); // grabará en aac
  }

  Future<void> _stopRecordingAndSend() async {
    String? path = await _recorder.stopRecorder();
    if (path == null) return;

    File audio = File(path);
    List<int> bytes = await audio.readAsBytes();

    String destination = ipController.text.trim();

    if (destination.isNotEmpty) {
      await _udp.send(
        bytes,
        Endpoint.unicast(InternetAddress(destination), port: Port(port)),

      );
    }
    audio.delete();
  }

  @override
  void dispose() {
    _recorder.closeRecorder();
    _udp.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Padding(
                padding: EdgeInsets.all(16),
                child: TextField(
                    controller: ipController,
                    decoration: InputDecoration(
                        labelText:'IP destino'
                    )
                )
            ),
            ElevatedButton(
              onPressed: () async {
                if (_isRecording) {
                  await _stopRecordingAndSend();
                  setState(() {
                    _isRecording = false;
                  });
                } else {
                  await _startRecording();
                  setState(() {
                    _isRecording = true;
                  });
                }
              },
              child: Text(_isRecording ? "Dejar de hablar" : "Hablar"),
            )
          ],
        )
    );
  }
}

