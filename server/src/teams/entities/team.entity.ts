import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TeamFunction } from '../../users/entities/function.entity';
import { Journal } from '../../events/entities/journal.entity';
import { Form } from '../../forms/entities/form.entity';
import { Requisitions } from './requisition.entity';

@Entity('teams')
export class Team {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  title: string;

  @ApiProperty()
  @CreateDateColumn({ default: () => 'now()' })
  creation_date: Date;

  @ApiProperty()
  @Column('simple-array')
  image: string[];

  @ApiProperty()
  @Column('simple-array')
  tags: string[];

  @ApiProperty()
  @Column()
  description: string;

  @ApiProperty()
  @Column({ nullable: true })
  short_description: string;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: ['direction', 'university', 'teams'],
    default: 'teams',
  })
  type_team: string;

  @ApiProperty()
  @Column()
  shortname: string;

  @ApiProperty()
  @Column({ default: false })
  is_archive: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  cabinet: string;

  @ApiProperty()
  @Column({ nullable: true })
  charter_team: string;

  @ApiProperty()
  @Column({ nullable: true })
  document: string;

  @ApiProperty()
  @Column({ default: true })
  set_open: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  phoneNumber: string;

  @ApiProperty()
  @Column('simple-array')
  linksSocialNetwork: string[];

  @ApiProperty()
  @Column({ nullable: true })
  address: string;

  @ApiProperty()
  @Column({ nullable: true })
  officeHours: string;

  @ManyToOne(() => Team, (team) => team.id)
  @JoinColumn([{ name: 'id_parent' }])
  id_parent: Team;

  @OneToMany(() => TeamFunction, (func) => func.team, { cascade: true })
  functions: TeamFunction[];

  @OneToMany(() => Journal, (journal) => journal.team, { cascade: true })
  journal: Journal[];

  @OneToMany(() => Form, (form) => form.team, { cascade: true })
  forms: Form[];

  @OneToMany(() => Requisitions, (requisition) => requisition.team)
  requisitions: Requisitions[];
}
