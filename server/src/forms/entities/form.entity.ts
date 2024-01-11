
import { Team } from "../../teams/entities/team.entity"
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { FormField } from "./form_field.entity"
import { ApiProperty } from "@nestjs/swagger"

@Entity("forms")
export class Form {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number

    @ApiProperty() 
    @Column()
    date: Date

    @ApiProperty() 
    @Column()
    description: string


    @ApiProperty()
    @ManyToOne(()=>Team, (team)=> team.id, {onDelete:'CASCADE'})
    @JoinColumn([{ name: "team_id" }])
    team:Team

    @OneToMany((type) => FormField, (formField) => formField.form, {onDelete:'CASCADE'})
    form_field: FormField[]
}

