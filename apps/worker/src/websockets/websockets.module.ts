import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WebsocketsGateway } from './websockets.gateway';

@Module({
  imports: [ConfigModule],
  providers: [WebsocketsGateway],
  exports: [WebsocketsGateway],
})
export class WebsocketsModule {}
