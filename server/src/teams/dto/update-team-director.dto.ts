import { IsOptional } from 'class-validator';

export class UpdateTeamDirectorDto {
  @IsOptional()
  title: string;

  @IsOptional()
  description: string;

  @IsOptional()
  tags: string[];

  @IsOptional()
  phoneNumber: string;

  @IsOptional()
  linksSocialNetwork: string[];

  @IsOptional()
  address: string;

  @IsOptional()
  officeHours: string;
}
