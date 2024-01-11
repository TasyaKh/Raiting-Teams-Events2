import {IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, Length} from 'class-validator'
import { Type } from 'class-transformer'
import { Form } from '../entities/form.entity'
import { Team } from 'src/teams/entities/team.entity'

export class createUserFormDto{
    
    @IsOptional()
    @IsNotEmpty({ message: 'Поле пустое' })
    value:string

    @IsNumber()
    @Type(() => Number)
    user:number

    @IsNumber()
    @Type(() => Number)
    field:number
}

export class createFormDto{
    
    @Type(() => Number)
    @IsNumber()
    team_id:Team
}

export class createFormFieldsDto{

    @Type(() => Number)
    @IsNumber()
    form:Form

    @IsString()
    @IsNotEmpty({ message: 'Поле пустое' })
    title:string

    @IsBoolean()
    @Type(() => Boolean)
    required:boolean
}