import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../users/entities/user.entity";
import { UserFunction } from "../users/entities/user_function.entity";
import { Repository, SelectQueryBuilder } from "typeorm";
import { CreateTeamDto } from "./dto/create-team.dto";
import { UpdateTeamDto } from "./dto/update-team.dto";
import { Team } from "./entities/team.entity";
import { UsersService } from "../users/users.service";
import { SearchTeamDto } from "./dto/search-team.dto";
import { Requisitions } from "./entities/requisition.entity";
import { RequisitionDto } from "./dto/update-requisition.dto";
import { GeneralService } from "../general/general.service";
import { DictionaryDto } from "src/general/dto/dictionary.dto";
import { UserFunctionDto } from "src/users/dto/user-functions.dto";

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team) // user //,
    private readonly teamsRepository: Repository<Team>,
    @InjectRepository(User) // user //,
    private readonly usersRepository: Repository<User>,
    @InjectRepository(UserFunction)
    private readonly userFunctionsRepository: Repository<UserFunction>,
    @InjectRepository(Function)
    private readonly functionsRepository: Repository<Function>,

    private readonly usersService: UsersService,
    private readonly dictionaryService: GeneralService,

    @InjectRepository(Requisitions)
    private readonly requisitionsRepository: Repository<Requisitions>
  ) {}

  async findOne(id: number) {
    const head = "Руководитель";

    let res = await this.teamsRepository
      .createQueryBuilder("teams")

      .select([
        "teams.id",
        "teams.title",
        "teams.tags",
        "teams.image",
        "teams.description",
        "teams.short_description",
        "teams.type_team",
        "teams.cabinet",
        "teams.is_archive",
        "teams.document",
        "teams.shortname",
        "teams.charter_team",
        "teams.id_parent",
      ])
      .where("teams.id = :id", { id: id })
      .andWhere("teams.type_team = :type", { type: "teams" })
      .leftJoin("teams.functions", "functions")
      // select direction
      .leftJoin("teams.id_parent", "direction")
      .addSelect("direction.id")
      .addSelect("functions.title")
      .andWhere("functions.title = :head", { head: head })

      .leftJoin("functions.userFunctions", "user_functions")
      .addSelect("user_functions.id")
      .leftJoinAndSelect("user_functions.user", "user")
      .getOne();
    // .addSelect("user.title_role")

    return res;
  }

  // Обновить коллектив
  async update(id: number, updateTeamDto: UpdateTeamDto) {
    updateTeamDto.id_parent = updateTeamDto.id_parent ?? null;
    let team = await this.teamsRepository.save({
      id,
      ...updateTeamDto,
      charter_team: updateTeamDto.charterTeam,
    });

    // удалить прошлого лидера
    if (
      updateTeamDto.oldLeaderId != null &&
      updateTeamDto.newLeaderId != null
    ) {
      const ufDto = new UserFunctionDto();
      ufDto.team = team.id;
      ufDto.user = updateTeamDto.oldLeaderId;

      let uFs = await this.usersService.findUserFunctions(ufDto);

      uFs.forEach(async (uF) => {
        await this.usersService.removeUserFunction(uF.id);
      });

      // назначить нового пользвоателя
      let newUserFunction = await this.usersService.assignRole(
        team.id,
        updateTeamDto.newLeaderId,
        "Руководитель"
      );
    }

    return team;
  }

  //создать коллектив, с учетом, что есь минимум 1 лидер
  async create(createTeamDto: CreateTeamDto): Promise<Team> {
    let team = await this.teamsRepository.save({
      ...createTeamDto,
      charter_team: createTeamDto.charterTeam,
      image: [],
      tags: [],
      type_team: "teams",
      creation_date: new Date(),
    });

    await this.usersService.assignRole(
      team.id,
      createTeamDto.userID,
      "Руководитель"
    );

    return team;
  }

  // get all teams with leadeaders
  async findAll(params: SearchTeamDto): Promise<[Team[], number]> {
    const head = "Руководитель";
    // console.log(params)

    let query = await this.teamsRepository
      .createQueryBuilder("teams")

      .select([
        "teams.id",
        "teams.title",
        "teams.tags",
        "teams.image",
        "teams.description",
        "teams.short_description",
        "teams.type_team",
        "teams.cabinet",
        "teams.is_archive",
        "teams.document",
        "teams.shortname",
        "teams.charter_team",
        "teams.id_parent",
        "teams.set_open",
      ])
      .where("teams.type_team = :type", { type: "teams" })
      .leftJoin("teams.functions", "functions")
      // select direction
      .leftJoin("teams.id_parent", "direction")
      // .andWhere("functions.title = :head", { head: head })
      .leftJoin("functions.userFunctions", "user_functions")
      .leftJoin("user_functions.user", "user")

      .orderBy("teams.id", "DESC");

    query = await this.filterTeam(params, query);
    query = query
      .take(params.limit) // Set the limit
      .skip(params.offset); // Set the offset

    let team = await query.getManyAndCount();
    return team;
  }

  // отфильтровать колелктивы
  async filterTeam(params: SearchTeamDto, q: SelectQueryBuilder<Team>) {
    let query = q;

    //если у нас все параметры то через 'или' все ищем
    if (params.title && params.description && params.tags) {
      //делаем все столбцы в нижнем регистре и ищем по всем столбцам через предлог "или"
      query = query.andWhere(
        `(LOWER(teams.title) like :title 
         or LOWER(teams.description) like :description 
         or LOWER(teams.tags) like :tags)`,
        {
          title: `%${params.title}%`,
          description: `%${params.description}%`,
          tags: `%${params.tags}%`,
        }
      );
    } else {
      //если не все параметры, то ищем через 'и'

      //if title (если у нас есть тайтл то ищем по нему)
      params.title
        ? query.andWhere("LOWER(teams.title) like :title", {
            title: `%${params.title}%`,
          })
        : query;
      //if description
      params.description
        ? query.andWhere("LOWER(teams.description) like :description", {
            description: `%${params.description}%`,
          })
        : query;
      //if description
      params.tags
        ? query.andWhere("LOWER(teams.tags) like :tags", {
            tags: `%${params.tags}%`,
          })
        : query;
    }

    //отфильтровать по направлению
    params.directions
      ? query.andWhere("teams.id_parent in (:...id_parents)", {
          id_parents: params.directions,
        })
      : query;

    if (params.is_archive != null) {
      //отфильтровать по типу коллектива
      query.andWhere("teams.is_archive = :is_archive", {
        is_archive: params.is_archive,
      });
    }

    // набор
    if (params.set_open != null) {
      query.andWhere("teams.set_open = :set_open", {
        set_open: params.set_open,
      });
    }

    return query;
  }

  // get all teams of specific direction for statistic
  async findAllTeamsOfDirection(id_parent = -1): Promise<[Team[], number]> {
    const type_team = "teams";

    let teams = this.teamsRepository
      .createQueryBuilder("teams")

      .select([
        "teams.id",
        "teams.title",
        "teams.image",
        "teams.description",
        "teams.type_team",
        "teams.shortname",
      ])
      .where("teams.type_team = :type", { type: type_team });

    // с учетом направления
    if (id_parent > 0) {
      teams
        .andWhere("teams.id_parent = :id_parent ", { id_parent: id_parent })
        .leftJoin("teams.id_parent", "id_parent")
        .addSelect(["id_parent.id", "id_parent.shortname"]);
    }

    return await teams.getManyAndCount();
  }

  async findDirections(id_parent = -1) {
    // const head = "Руководитель"

    const directionsAndUsers = this.teamsRepository
      .createQueryBuilder("teams")
      .select([
        "teams.shortname",
        "teams.type_team",
        "teams.id",
        "teams.title",
        "teams.short_description",
        "teams.description",
        "teams.cabinet",
      ])
      .andWhere("teams.type_team = :type", { type: "direction" })
      .leftJoinAndSelect("teams.functions", "functions")
      .addSelect(["functions.title"])
      .leftJoin("functions.userFunctions", "user_functions")
      .addSelect("user_functions.id")
      .leftJoin("user_functions.user", "user")
      .addSelect(["user.fullname", "user.email", "user.phone", "user.image"]);

    // с учетом направления
    if (id_parent > 0) {
      directionsAndUsers
        .andWhere("teams.id_parent = :id_parent ", { id_parent: id_parent })
        .leftJoin("teams.id_parent", "id_parent")
        .addSelect(["id_parent.id", "id_parent.shortname"]);
    }

    return await directionsAndUsers.getManyAndCount();
  }

  //вывести команду
  async teamWithUsers(id: number): Promise<UserFunction[]> {
    const users = await this.userFunctionsRepository

      .createQueryBuilder("user_functions")
      .select(["user_functions.dateStart", "user_functions.dateEnd"])
      .leftJoinAndSelect("user_functions.user", "user")
      .innerJoin("user_functions.function", "function")
      .addSelect("function.title")
      .innerJoin("function.team", "team")
      .where("team.id = :id", { id })
      .getMany();

    return users;
  }

  // requisition --------------------------------------------------------------------

  // обновить заявку пользователя на вступление
  async updateRequisition(id: number, updateRequisitionDto: RequisitionDto) {
    const dict_class_id = 6;

    let findDict = null;

    const dd = new DictionaryDto(
      updateRequisitionDto.status_name,
      dict_class_id
    );

    // найти знаечние в словаре,чтобы ид получить
    if (updateRequisitionDto.status_name) {
      findDict = (await this.dictionaryService.findAll(dd))[0];
    }

    const body = {
      id: id,
      ...updateRequisitionDto,
      status: findDict,
      date_update: new Date(),
    };

    // сохранить новые данные заявки
    let req = await this.requisitionsRepository.save(body);

    return req;
  }

  async findAllRequisitions(
    team_id: number = null,
    reqDto: RequisitionDto
  ): Promise<Requisitions[]> {
    const rejectStatus = "Принята";

    let query = this.requisitionsRepository
      .createQueryBuilder("requisition")
      .select([
        "requisition.date_create",
        "requisition.date_update",
        "requisition.status",
        "requisition.id",
      ])
      .leftJoinAndSelect("requisition.user", "user")
      // взять статус со словаря
      .leftJoinAndSelect("requisition.status", "status")

      .leftJoin("requisition.requisition_fields", "rf")
      .leftJoin("rf.form_field", "form_field")
      .leftJoin("form_field.form", "form")
      // .addSelect(["form.id"])
      .where("form.team_id = :team_id", { team_id })
      .orWhere("requisition.team_id = :team_id", { team_id })
      // пользователей с этим статусом н показывать

      .orderBy("status.name", "DESC");

    reqDto.user_id
      ? query.andWhere("user.id = :user_id", { user_id: reqDto.user_id })
      : query.andWhere("status.name != :rejectStatus", {
          rejectStatus: rejectStatus,
        });

    return await query.getMany();
  }

  async findRequisition(req_id: number): Promise<Requisitions> {
    const req = await this.requisitionsRepository.findOne({
      where: { id: req_id },
      relations: {
        user: true,
        team: true,
        requisition_fields: {
          form_field: {
            form: {
              team: true,
            },
          },
        },
      },
    });

    return req;
  }

  async findAllRequisitionsByUserId(userId: number): Promise<Requisitions[]> {
    return await this.requisitionsRepository
      .createQueryBuilder("requisition")
      .select([
        "requisition.date_create",
        "requisition.date_update",
        "requisition.status",
        "requisition.id",
      ])
      .leftJoinAndSelect("requisition.status", "status")
      .leftJoin("requisition.requisition_fields", "rf")
      .leftJoin("rf.form_field", "form_field")
      .leftJoin("form_field.form", "form")
      .leftJoinAndSelect("requisition.team", "team")
      .where("requisition.user.id = :userId", { userId })
      .orderBy("status.name", "DESC")
      .getMany();
  }
  // requisition --------------------------------------------------------------------

  async teamsFunctions(id: number) {
    //начинаем с функций пользователя
    const teamsFunctions = await this.functionsRepository
      .createQueryBuilder("functions")
      .innerJoin("functions.team", "team")
      .addSelect("team.title")
      .where("functions.team_id = :id", { id: id })
      .getMany();

    return teamsFunctions;
  }

  //архивировать или наоборот
  async changeArchiveTeam(id: number, isArchive: boolean) {
    return await this.teamsRepository.update(id, { is_archive: isArchive });
  }

  async addImage(id: number, filePath: string): Promise<Team> {
    let team = await this.findOne(id);
    team.image.push(filePath);

    return await this.teamsRepository.save({
      id: team.id,
      image: team.image,
    });
  }
}
