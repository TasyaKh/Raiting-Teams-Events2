import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Query, Put, SetMetadata, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { CreateJournalDto } from './dto/create-journal.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Event } from './entities/event.entity';
import { SearchEventDto } from './dto/search-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { LocalAuthGuard } from 'src/users/guard/local-auth.guard';
import { User } from 'src/general/decorators/user.decorator';
import { PermissionsGuard } from 'src/users/guard/check-permissions.guard';

@ApiTags('events')  // <---- Отдельная секция в Swagger для всех методов контроллера
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) { }

  @Put(':id')
  @UseGuards(LocalAuthGuard, PermissionsGuard)
  @SetMetadata('permissions', ['can create events'])
  @ApiOperation({ summary: "обновить мерприятие" })
  @ApiResponse({ status: HttpStatus.OK, description: "Успешно", type: [Event] })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  update(@Param("id") id: number, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete("/:id")
  @ApiOperation({ summary: "Удаление мероприятия по id" })
  @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  async deleteEvent(@User() userId: number, @Param('id') event_id: number) {

    // const searchDto = new SearchEventDto()
    // searchDto.id = event_id
    // searchDto.user_id = userId
    // // проверить является ли юзер владельцем мероприятия
    // const userEvent = await this.eventsService.findAllEvents(searchDto);
    // if (userEvent || userEvent.) {

    // }

    return await this.eventsService.deleteEvent(event_id);
  }

  @Get('/external')
  @ApiOperation({ summary: "Получение списка внешних мероприятий" })
  @ApiResponse({ status: HttpStatus.OK, description: "Успешно", type: [Event] })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  findAll() {
    return this.eventsService.findAllExternal();
  }

  @Get('/tags')
  @ApiOperation({ summary: "Получение списка мероприятий по тегам" })
  @ApiResponse({ status: HttpStatus.OK, description: "Успешно", type: [Event] })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  findTags(@Query() { tags }) {
    return this.eventsService.findTags(tags);
  }

  @Get('/journals')
  @ApiOperation({ summary: "Получение мероприятий через журнал" })
  @ApiResponse({ status: HttpStatus.OK, description: "Успешно", type: [Event] })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  findJournals(@Query() { event_id = null, title = null }) {

    return this.eventsService.findAllJournals(event_id, title);
  }

  @Get('/journals/getEventUsers/:id')
  @ApiOperation({ summary: "Получение" })
  @ApiResponse({ status: HttpStatus.OK, description: "Успешно", type: [Event] })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  getEventUsers(@Param('id') id: string) {

    return this.eventsService.getEventUsers(+id);
  }



  @Get()
  @ApiOperation({ summary: "Универсальный запрос на получение списка мероприятий с учетом различных параметров" })
  @ApiResponse({ status: HttpStatus.OK, description: "Успешно", type: [Event] })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  findAllEvents(@Query() searchEvent: SearchEventDto) {
  
    return this.eventsService.findAllEvents(searchEvent);
  }

  @Post()
  @UseGuards(LocalAuthGuard, PermissionsGuard)
  @SetMetadata('permissions', ['can create events'])
  @ApiOperation({ summary: "Создать новое мероприятие" })
  @ApiBody({ description: "название коллектива, ФИО руководителя, описание проекта", required: true })
  @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request, какие то данные неверно введены" })
  create(@Body() createEventDto: CreateEventDto) {

    return this.eventsService.create(createEventDto);
  }

  @Post("/journal/add")
  @ApiOperation({ summary: "Создать новое мероприятие" })
  @ApiBody({ description: "название коллектива, ФИО руководителя, описание проекта", required: true })
  @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request, какие то данные неверно введены" })
  createJournal(@Body() createJournal: CreateJournalDto) {

    return this.eventsService.createJournal(createJournal);
  }

  @Patch("/journal/isParticipation/")
  @ApiOperation({ summary: "333" })
  @ApiBody({ description: "333", required: true })
  @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request, какие то данные неверно введены" })
  async updateJournal(@Query() { user_id, event_id }) {
    return this.eventsService.updateJournal(event_id, user_id);
  }


  @Delete("/journal/deleteUser")
  @ApiOperation({ summary: "333" })
  @ApiBody({ description: "333", required: true })
  @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request, какие то данные неверно введены" })
  async deleteJournal(@Query() { user_id, event_id }) {
    return this.eventsService.deleteJournal(event_id, user_id);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.eventsService.findOne(+id);
  // }

  @Get('/external/:id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(+id);
  }

  // @Get('journal')
  // @ApiOperation({ summary: "Получение списка мероприятий из журнала" })
  // @ApiResponse({ status: HttpStatus.OK, description: "Успешно", type: [Event] })
  // @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  // findAllJournals(@Query() params) {
  //   return this.eventsService.findAllJournals(params.team_id);
  // }

  @Get('/:id')
  @ApiOperation({ summary: "Получение мероприятия" })
  @ApiResponse({ status: HttpStatus.OK, description: "Успешно", type: [Event] })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  find(@Param('id') id: number) {
    return this.eventsService.findOne(id);
  }


  @Get('events_of_team/:teamId')
  @ApiOperation({ summary: "Получение мероприятия коллектива по журналу" })
  @ApiResponse({ status: HttpStatus.OK, description: "Успешно", type: [Event] })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  getEventsViaJournalsByTeam(@Param('teamId') teamId, @Query() searchEventDto: SearchEventDto) {

    searchEventDto.teamId = teamId
    let res = this.eventsService.getEventsViaJournalsByTeam(searchEventDto)

    return res
  }

  @Get('journal/user/:id')
  @ApiOperation({ summary: "Получение списка мероприятий из журнала по id пользователя" })
  @ApiResponse({ status: HttpStatus.OK, description: "Успешно", type: [Event] })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  findAllJournalsByUserId(@Param("id") id: number) {
    return this.eventsService.findAllJournalByUserId(id)
  }
}
