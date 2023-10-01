
import { Entity } from "typeorm"
import { IsBoolean, IsDate, IsNumber, IsOptional } from "class-validator";
import { Transform, Type } from "class-transformer";

@Entity('events')
export class SearchEventDto {

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    teamId: number

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    id: number

    @IsOptional()
    type: string

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    level: number

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    direction: number

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    dateStart: Date

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    dateEnd: Date

    @IsOptional()
    title: string

    @IsOptional()
    tags: string

    @IsOptional()
    status: string

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    user_id: number

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    limit: number

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    offset: number

    // additional
    @IsOptional()
    search_txt: string

    @IsOptional()
    levels: number[] = []
    
    @IsOptional()
    types: number[] = []
    
}


