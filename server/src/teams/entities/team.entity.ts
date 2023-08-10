import { ApiProperty } from "@nestjs/swagger"
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Function } from "../../users/entities/function.entity";
import { Journal } from "../../events/entities/journal.entity";
import { Form } from "../../forms/entities/form.entity";

@Entity("teams")
export class Team {

    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number

    @ApiProperty() 
    @Column()
    title: string

    @ApiProperty() 
    @Column()
    creation_date: Date
    
    @ApiProperty() 
    @Column("simple-array")
    image: string[]

    @ApiProperty() 
    @Column("simple-array")
    tags: string[]

    @ApiProperty() 
    @Column()
    description: string

    @ApiProperty() 
    @Column({ nullable: true })
    short_description: string

    @ApiProperty() 
    @Column({
        type: "enum",
        enum: ["direction", "university", "teams"],
        default: "teams"
    })
    type_team: string

    @ApiProperty()
    @Column()
    shortname:string

    @ApiProperty()
    @Column({default:false})
    is_archive:boolean

    @ApiProperty()
    @Column({nullable:true})
    cabinet:string

    @ApiProperty()
    @Column({nullable:true})
    charter_team:string

    @ApiProperty()
    @Column({nullable:true})
    document:string

    @ApiProperty()
    @Column({default:true})
    set_open:boolean




    @ManyToOne((type)=>Team, (team)=>team.id)
    @JoinColumn([{ name: "id_parent" }])
    id_parent:Team

    @OneToMany((type)=>Function, (func)=>func.team, {cascade:true})
    @JoinColumn([{ name: "func_id" }])
    functions:Function[]
    
    @OneToMany((type) => Journal, (journal) => journal.team, {cascade:true})
    @JoinColumn([{ name: "journal_id" }])
    journal: Journal[]

    @OneToMany((type) => Form, (form) => form.team, {cascade:true})
    @JoinColumn([{ name: "form_id" }])
    forms: Form[]
}
