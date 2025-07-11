import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';
import { AppService } from './app.service';

// Extend process type to include pkg property
declare global {
  namespace NodeJS {
    interface Process {
      pkg?: boolean;
    }
  }
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  serveFrontend(@Res() res: Response) {
    // Determine the correct path for static files when packaged with pkg
    let staticPath: string;

    if (process.pkg) {
      // When running as pkg executable, use the snapshot path
      staticPath = join(
        process.execPath,
        '..',
        'snapshot',
        'backend',
        'dist',
        'static',
      );
    } else {
      // When running in development, use the normal path
      staticPath = join(__dirname, 'static');
    }

    const indexPath = join(staticPath, 'index.html');

    console.log(`Static files served from: ${staticPath}`);
    console.log(`Looking for index.html at: ${indexPath}`);

    if (existsSync(indexPath)) {
      console.log(`Serving frontend from: ${indexPath}`);
      return res.sendFile(indexPath);
    } else {
      // Fallback: try alternative paths
      const fallbackPaths = [
        join(__dirname, 'static', 'index.html'),
        join(__dirname, '..', 'static', 'index.html'),
        join(process.cwd(), 'static', 'index.html'),
        join(process.cwd(), 'dist', 'static', 'index.html'),
      ];

      for (const path of fallbackPaths) {
        if (existsSync(path)) {
          console.log(`Serving frontend from fallback: ${path}`);
          return res.sendFile(path);
        }
      }

      // If no file found, return a simple HTML response
      res.status(404).json({
        error: 'Frontend files not found',
        message: 'The Angular frontend files are not available in the executable',
        staticPath,
        indexPath,
        fallbackPaths,
      });
    }
  }
}

@Controller('api')
export class ApiController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth(): string {
    return this.appService.getHello();
  }
}
