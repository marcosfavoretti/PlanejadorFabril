import { ApiProperty } from '@nestjs/swagger';

export class UserResDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;
}
