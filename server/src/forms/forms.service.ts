import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { createUserFormDto } from './dto/create-form.dto';
import { createFormDto } from './dto/create-form.dto';
import { createFormFieldsDto } from './dto/create-form.dto';
import { Form } from './entities/form.entity';
import { FormField } from './entities/form_field.entity';
import { RequisitionFields } from './entities/requisition_fields.entity';
import { UpdateFieldDto } from './dto/update-field';

@Injectable()
export class FormsService {
  constructor(
    @InjectRepository(Form)  // user //,
    private readonly formRepository: Repository<Form>,
    @InjectRepository(FormField)  // user //,
    private readonly formFieldsRepository: Repository<FormField>,
    @InjectRepository(RequisitionFields)  
    private readonly userFormRepository: Repository<RequisitionFields>
  ) { }

  findAll() {
  }

  async findOnIdForm(team_id: number) {

    let res_forms = await this.formRepository
      .createQueryBuilder("form")
      .where("team_id = :team_id", {team_id: team_id})
      .getOne()
    let res_form_str = res_forms.id
  
          return res_form_str;
      }

  async findOnFormFields(team_id: number) {

    let archive = false
    let res_forms = await this.formRepository
      .createQueryBuilder("form")
      .where("team_id = :team_id", {team_id: team_id})
      .leftJoinAndSelect("form.form_field", "form_field")
      .andWhere("form_field.archive = :archive", {archive:archive})
      .getOne()

    // let res_form_str = res_forms.fields_id[0].toString()
    // let fieldsIds = res_form_str
    // .split('\n')
    // .map(value => {
    //   let parsedValue = parseInt(value, 10);
    //   return isNaN(parsedValue) ? null : parsedValue;
    // });
    // let res_fields_form = await this.formFieldsRepository
    //   .createQueryBuilder("form_fields")
    //   .where("id = any(:ids)", {ids:fieldsIds})
    //   .getMany()
    return res_forms;
  }

  async createFormUser(createUserFormDto: createUserFormDto): Promise<RequisitionFields> {

    let userForm = await this.userFormRepository.save({
      // ...createUserFormDto,
      // value: createUserFormDto.value,
      // user: createUserFormDto.user,
      // field: createUserFormDto.field,
      // date: new Date()
    })

    return userForm;
  }

  async createForm(createFormDto: createFormDto) {


    let form = await this.formRepository.save({ 
      team:createFormDto.team_id,
      ...createFormDto,
      date: new Date(),
      description: "description",
    })
    return form;
  }

  // async updateForm(id: number, UpdateFormDto: UpdateFormDto) {
  //    return await this.formRepository.update(id, UpdateFormDto)
  //   }

  async createFormField(createFormFieldsDto: createFormFieldsDto) {

    let field = await this.formFieldsRepository.save({
      ...createFormFieldsDto
    })

    return field;
  }

  async updateFormField(field_id:number, updateFieldDto: UpdateFieldDto) {
 
    return await this.formFieldsRepository.update(field_id,{
      ...updateFieldDto,
     
    })
  }

  remove(id: number) {
    return `This action removes a #${id} form`;
  }

  // получить ответы пользователей на анкету
  async fetchRequisitionForm(req_id: number) {
    const users = await this.formRepository
      .createQueryBuilder("form")
      .leftJoinAndSelect("form.form_field", "form_fields")
      .leftJoinAndSelect("form_fields.requisition_field", "req_field")
      .leftJoin("req_field.requisition", "requisition")
      .where("requisition.id = :id", {id:req_id})
      .getOne()

    return users;
  }

}
