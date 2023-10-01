import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateJournalDto } from './dto/create-journal.dto';
import { Event } from './entities/event.entity'
import { Type } from './enums/enums';
import { Journal } from './entities/journal.entity';
import { SearchEventDto } from './dto/search-event.dto';
import { DictionaryDto } from 'src/general/dto/dictionary.dto';
import { GeneralService } from 'src/general/general.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)  // user //,
    private readonly eventsRepository: Repository<Event>,
    @InjectRepository(Journal)
    private readonly journalsRepository: Repository<Journal>,
    private readonly dictionaryService: GeneralService,
  ) { }


  findAllExternal(): Promise<Event[]> {

    return this.eventsRepository
      .createQueryBuilder("events")
      .orderBy("events.dateStart")
      .leftJoinAndSelect("events.type", "type")
      .where("type.id = :type", { type: Type.OUTSIDE })
      .getMany()
  }

  findTitle(title: string) {

    return this.eventsRepository

      .createQueryBuilder("events")
      .select(["events.title", "events.images", "events.tags", "events.description", "events.dateStart"])
      .where("events.title like :title", { title: `%${title}%` })
      .getMany()

  }

  findTags(tags: string) {

    return this.eventsRepository

      .createQueryBuilder("events")
      .select(["events.title", "events.images", "events.tags", "events.description", "events.dateStart"])
      .where("events.tags like :tags", { tags: `%${tags}%` })


  }

  async deleteEvent(id: number) {
    return await this.eventsRepository.delete(id)
  }

  // конструктор запроса для получения мероприятия по нужным параметрам
  //если параметр был выбран, то добавляем его в запрос (И)
  async findAllEvents(searchEvent: SearchEventDto): Promise<[Event[], number]> {


    let buildQuery = this.eventsRepository
      .createQueryBuilder("events")
      .leftJoinAndSelect("events.level", "level")
      .leftJoinAndSelect("events.type", "type")
      .leftJoinAndSelect("events.direction", "direction")
      .leftJoinAndSelect("events.status", "status")
      // creator
      .leftJoinAndSelect("events.user", "user")
      .orderBy("events.date_update", "DESC")


    buildQuery = await this.filterEvents(searchEvent, buildQuery)

    return await buildQuery.getManyAndCount()
  }

  // фильтры для мероприятий
  async filterEvents(searchEvent: SearchEventDto, buildQuery: SelectQueryBuilder<Event>) {

    searchEvent.status != null ? buildQuery
      .andWhere("status.name = :status", { status: searchEvent.status }) :
      buildQuery

    // limit
    searchEvent.limit != null ? buildQuery.take(searchEvent.limit) : buildQuery

    // offset
    searchEvent.offset != null ? buildQuery.skip(searchEvent.offset) : buildQuery
    // user id
    searchEvent.user_id != null ? buildQuery
      .andWhere("user.id = :user_id", { user_id: searchEvent.user_id }) : buildQuery

    //id 
    searchEvent.id != null ? buildQuery
      .andWhere("events.id = :id", { id: searchEvent.id }) : buildQuery

    //title 
    searchEvent.title != null ? buildQuery
      .andWhere("events.title like :title", { title: `%${searchEvent.title}%` }) : buildQuery


    //tag 
    searchEvent.tags != null ? buildQuery
      .andWhere("events.tag = :tag", { tag: searchEvent.tags }) : buildQuery

    // event type
    searchEvent.type != null ? buildQuery
      .andWhere("type.id = :type", { type: searchEvent.type }) : buildQuery

    searchEvent.types.length > 0 ? buildQuery
      .andWhere("type.id in (:...types)", { types: searchEvent.types }) : buildQuery


    // event level
    searchEvent.level != null ? buildQuery
      .andWhere("level.id = :level", { level: searchEvent.level }) : buildQuery

    searchEvent.levels.length > 0 ? buildQuery
      .andWhere("level.id in (:...levels)", { levels: searchEvent.levels }) : buildQuery


    // event direction
    searchEvent.direction != null ? buildQuery
      .andWhere("events.direction = :direction", { direction: searchEvent.direction }) : buildQuery

    // event dateStart
    searchEvent.dateStart != null ? buildQuery
      .andWhere("events.dateStart >= :dateStart", { dateStart: searchEvent.dateStart }) : buildQuery

    // event dateEnd
    searchEvent.dateEnd != null ? buildQuery
      .andWhere("events.dateEnd <= :dateEnd", { dateEnd: searchEvent.dateEnd }) : buildQuery

    // additional
    // search_txt
    if (searchEvent.search_txt) {

      buildQuery = buildQuery.andWhere(
        `(LOWER(events.title) like :title 
     or LOWER(events.description) like :description 
     or LOWER(events.tags) like :tags)`, {
        title: `%${searchEvent.search_txt}%`,
        description: `%${searchEvent.search_txt}%`,
        tags: `%${searchEvent.search_txt}%`
      })
    }

    return buildQuery

  }


  findOne(id: number) {
    return this.eventsRepository.findOne({ where: { id: id }, relations: { level: true, type: true, direction: true } });
  }



  async update(id: number, updateEventDto: UpdateEventDto) {

    let status = (await this.dictionaryService.findAll(new DictionaryDto(updateEventDto.status, 6)))[0]

    let event = await this.eventsRepository.save({
      id,
      date_update: new Date(),
      ...updateEventDto,
      status: status
    })

    return event
  }



  remove(id: number) {
    return `This action removes a #${id} event`;
  }




  // journals-------------------------------------------------------------------------


  getEventUsers(id: number) {

    return this.journalsRepository

      .createQueryBuilder("journals")
      .where("journals.event_id = :event_id", { event_id: id })
      .andWhere("journals.is_registered = true")
      .leftJoin("journals.user", "users")
      .addSelect("users.id")
      .leftJoin("journals.team", "teams")
      .addSelect("teams.id")
      .leftJoin("journals.event", "events")
      .addSelect(["events.title", "events.id"])
      .getMany()

  }

  async findAllJournals(event_id: number = null, title: string = null): Promise<[Journal[], number]> {

    let buildQuery = this.journalsRepository
      .createQueryBuilder("journals")
      .leftJoin("journals.user", "users")
      .addSelect("users.id")
      .leftJoin("journals.team", "teams")
      .addSelect("teams.id")
      .leftJoin("journals.event", "events")
      .addSelect(["events.title", "events.id"])
    // .where("events.title like :title", {title: `%${title}%`})


    buildQuery = title != null ? buildQuery

      .where("events.title like :title", { title: `%${title}%` })
      .andWhere("journals.is_registered = true") : buildQuery




    //id 
    buildQuery = event_id != null ? buildQuery

      .andWhere("journals.event_id = :event_id", { event_id: event_id })
      .andWhere("journals.is_registered = true") : buildQuery

    //     //title 
    // buildQuery = title != null ? buildQuery
    //   .andWhere("events.title like :title" , { title: `%${title}%`}) : buildQuery

    // buildQuery = team != null ? buildQuery
    //   .where("journals.team_id = :team", { team: team }) : buildQuery

    return buildQuery.getManyAndCount()
  }

  async findAllJournalByUserId(id: number) {
    let buildQuery = this.journalsRepository
      .createQueryBuilder("journals")
      .leftJoin("journals.team", "team")
      .addSelect("team")
      .leftJoin("journals.event", "event")
      .addSelect("event")

    buildQuery = id != null ? buildQuery
      .andWhere("journals.user_id = :id", { id: id }) : buildQuery

    return buildQuery.getManyAndCount()
  }

  // journals-------------------------------------------------------------------------


  findJournals(team: number = null): Promise<[Journal[], number]> {


    let buildQuery = this.journalsRepository
      .createQueryBuilder("journals")
      .leftJoin("journals.team", "team")
      .addSelect("team.id")
      .leftJoin("journals.event", "event")
      .addSelect("event.id")


    buildQuery = team != null ? buildQuery
      .where("journals.team_id = :team", { team: team }) : buildQuery

    return buildQuery.getManyAndCount()
  }


  // journals-------------------------------------------------------------------------



  async getEventsViaJournalsByTeam(searchEventDto: SearchEventDto): Promise<[Event[], number]> {


    // alert("teamId " + teamId)
    let data = await this.findJournals(searchEventDto.teamId)
    let countAppropriate = 0

    //получить всех найденне journal
    let journals = data[0]

    let arrayData: Event[] = []


    for (let i = 0; i < journals.length; i++) {
      let journal = journals[i]


      let eventId = journal.event.id

      searchEventDto.id = eventId
      let event = (await this.findAllEvents(searchEventDto))[0]


      if (event != null && event[0] != null) {
        //  предполагается несколько данных, но мы знаем, что у нас один будет
        arrayData.push(event[0])
        countAppropriate++
      }
    }

    return [arrayData, countAppropriate]

  }


  async createJournal(createJournalDto: CreateJournalDto): Promise<Journal> {

    let journal = await this.journalsRepository.save({
      ...createJournalDto,
      // image: [],
      // tags: [],
      // type_team: "teams",
      // creation_date: new Date()
    })
    // console.log(journal)
    return journal;
  }


  async create(createEventDto: CreateEventDto): Promise<Event> {

    let status = (await this.dictionaryService.findAll(new DictionaryDto("Создана", 6)))[0]

    let event = await this.eventsRepository.save({
      ...createEventDto,
      status: status
      // image: [],
      // tags: [],
      // type_team: "teams",
      // creation_date: new Date()
    })


    return event;
  }

  async updateJournal(event_id: number, user_id: number) {


    return await this.journalsRepository
      .createQueryBuilder("journals")
      .update()
      .set({ is_registered: true })
      .where("journals.event_id = :event_id", { event_id: event_id })
      .andWhere("journals.user_id = :user_id", { user_id: user_id })
      .execute()

  }


  async deleteJournal(event_id: number, user_id: number) {

    return await this.journalsRepository
      .createQueryBuilder("journals")
      .delete()
      .where("journals.event_id = :event_id", { event_id: event_id })
      .andWhere("journals.user_id = :user_id", { user_id: user_id })
      .execute()

  }
}


