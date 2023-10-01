import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  HttpStatus,
  Query,
  UploadedFile,
  UseInterceptors,
  UploadedFiles,
  Req,
  SetMetadata,
  UseGuards,
  ForbiddenException,
} from "@nestjs/common";
import { TeamsService } from "./teams.service";
import { CreateTeamDto } from "./dto/create-team.dto";
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Team } from "./entities/team.entity";
import { UserFunction } from "../users/entities/user_function.entity";
import { UsersService } from "../users/users.service";
import { UpdateTeamDto } from "./dto/update-team.dto";
import { UploadsService } from "../uploads/uploads.service";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { SearchTeamDto } from "./dto/search-team.dto";
import { Requisitions } from "./entities/requisition.entity";
import { Request } from "express";
import { FileSizeValidationPipe } from "src/uploads/validation/file.validation.pipe";
import { FileImageValidationPipe } from "src/uploads/validation/image_file.validation.pipe";
import { RequisitionDto } from "./dto/update-requisition.dto";
import { LocalAuthGuard } from "src/users/guard/local-auth.guard";
import { User } from "src/general/decorators/user.decorator";
import { PermissionsGuard } from "src/users/guard/check-permissions.guard";

@ApiTags("teams") // <---- Отдельная секция в Swagger для всех методов контроллера
@Controller("teams")
export class TeamsController {
  constructor(
    private readonly teamsService: TeamsService,
    private readonly usersService: UsersService,
    private readonly uploadsService: UploadsService
  ) {}

  // @Get()
  // @ApiOperation({ summary: "Получение списка коллективов с их руководителями" })
  // @ApiResponse({ status: HttpStatus.OK, description: "Успешно", type: [Team] })
  // @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  // findAll() {
  //   return this.teamsService.findAll();

  // }

  @Get()
  @ApiOperation({ summary: "Получение списка коллективов с их руководителями" })
  @ApiResponse({ status: HttpStatus.OK, description: "Успешно", type: [Team] })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  findAll(@Query() params: SearchTeamDto) {
    return this.teamsService.findAll(params);
  }

  @Get("of-direction")
  @ApiOperation({ summary: "Получение списка  коллективов направления" })
  @ApiParam({
    name: "type_team",
    required: false,
    description: "указать тип коллектива",
  })
  @ApiParam({
    name: "id_parent",
    required: false,
    description: "указать его родителя (если коллектив, то направление)",
  })
  @ApiResponse({ status: HttpStatus.OK, description: "Успешно", type: [Team] })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  findAllTeamsOfDirection(@Query() params) {
    return this.teamsService.findAllTeamsOfDirection(params.id_parent);
  }

  @Get("directions")
  @ApiOperation({
    summary: "отдает список направлений с юзерами которые за них отвечают",
  })
  @ApiParam({
    name: "directions",
    required: true,
    description: "Идентификатор ",
  })
  @ApiResponse({ status: HttpStatus.OK, description: "Успешно", type: Team })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  findDirections(@Query() params) {
    return this.teamsService.findDirections(params.id_parent);
  }

  @Put(":id/archive")
  @UseGuards(LocalAuthGuard, PermissionsGuard)
  @SetMetadata("permissions", ["can create teams"])
  @ApiOperation({ summary: "Архивировать коллектив или наоборот" })
  @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Bad Request, какие то данные неверно введены",
  })
  changeArchiveTeam(@Param("id") id, @Body() data) {
    return this.teamsService.changeArchiveTeam(id, data.isArchive);
  }

  @Put(":id")
  @UseGuards(LocalAuthGuard, PermissionsGuard)
  @SetMetadata("permissions", ["can create teams"])
  @ApiOperation({
    summary: "Обновить коллектив (ответственный по направлению)",
  })
  @ApiBody({
    description: "название коллектива, ФИО руководителя, описание проекта",
    required: true,
  })
  @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Bad Request, какие то данные неверно введены",
  })
  @UseInterceptors(FilesInterceptor("files"))
  async update(
    @Req() request: Request,
    @Param("id") id: number,
    @UploadedFiles(new FileSizeValidationPipe()) files: Express.Multer.File[],
    @Body() updateTeamDto: UpdateTeamDto
  ) {
    const startPathUrl = `${request.protocol}://${request.get("host")}`;

    // устав коллектива
    let ustavPath = updateTeamDto.charterTeam;
    //документ
    let docPath = updateTeamDto.document;

    // console.log("ustav1 " + ustavPath)
    // console.log("doc1 " + docPath)

    if (files.length < 3) {
      for (let f in files) {
        //оставить только начало файла без расширения
        if (files[f].originalname.split(".").shift() == "ustav") {
          ustavPath = await this.uploadsService.uploadFile(
            startPathUrl,
            files[f]
          );
        } else if (files[f].originalname.split(".").shift() == "document") {
          docPath = await this.uploadsService.uploadFile(
            startPathUrl,
            files[f]
          );
        }
      }
    }

    updateTeamDto.charterTeam = ustavPath;

    updateTeamDto.document = docPath;

    let team = await this.teamsService.update(id, updateTeamDto);

    return team;
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.teamsService.remove(+id);
  // }

  //по ид команды найти всех юзеров
  @Get(":id/users")
  @ApiOperation({ summary: "Получение участников коллектива по id коллектива" })
  @ApiParam({
    name: "id",
    required: true,
    description: "Идентификатор коллектива",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Успешно",
    type: UserFunction,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  teamsAndUsers(@Param("id") id: number) {
    return this.teamsService.teamWithUsers(id);
  }

  @Get(":id")
  @ApiOperation({ summary: "Получение коллектива по id" })
  @ApiParam({
    name: "id",
    required: true,
    description: "Идентификатор коллектива",
  })
  @ApiResponse({ status: HttpStatus.OK, description: "Успешно", type: Team })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  findOne(@Param("id") id: number) {
    return this.teamsService.findOne(id);
  }

  @Get(":id/functions")
  @ApiOperation({ summary: "Получение списка должностей в коллективе" })
  @ApiParam({
    name: "id",
    required: true,
    description: "Идентификатор коллектива",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Успешно",
    type: Function,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  teamsFunctions(@Param("id") id: number) {
    return this.teamsService.teamsFunctions(id);
  }

  @Post()
  @UseGuards(LocalAuthGuard, PermissionsGuard)
  @SetMetadata("permissions", ["can create teams"])
  @ApiOperation({
    summary: "Создать новый коллектив (ответственный по направлению)",
  })
  @ApiBody({
    description: "название коллектива, ФИО руководителя, описание проекта",
    required: true,
  })
  @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Bad Request, какие то данные неверно введены",
  })
  @UseInterceptors(FilesInterceptor("files"))
  async create(
    @Req() request: Request,
    @UploadedFiles(new FileSizeValidationPipe()) files: Express.Multer.File[],
    @Body() createTeamDto: CreateTeamDto
  ) {
    //, @Body() createTeamDto: CreateTeamDto

    const startPathUrl = `${request.protocol}://${request.get("host")}`;

    let ustav = null;
    let doc = null;

    for (let f in files) {
      //оставить только начало файла без расширения
      if (
        files[f].originalname.split(".").shift() == "ustav" &&
        ustav == null
      ) {
        ustav = await this.uploadsService.uploadFile(startPathUrl, files[f]);
      } else if (
        files[f].originalname.split(".").shift() == "document" &&
        doc == null
      ) {
        doc = await this.uploadsService.uploadFile(startPathUrl, files[f]);
      }
    }

    createTeamDto.charterTeam = ustav;
    createTeamDto.document = doc;

    let team = await this.teamsService.create(createTeamDto);

    return team;
  }

  @Post(":id/image")
  @UseGuards(LocalAuthGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({ summary: "Загрузить изображение коллектива" })
  @ApiParam({
    name: "id",
    required: true,
    description: "Идентификатор коллектива",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Успешно",
    type: Function,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  async addImage(
    @User() userId: number,
    @Req() request: Request,
    @Param("id") id: number,
    @UploadedFile(new FileImageValidationPipe()) file: Express.Multer.File
  ) {
    const hasPermissions = await this.usersService.hasPermissionsInTeam(
      userId,
      id,
      ["special"]
    );

    if (hasPermissions) {
      const startPathUrl = `${request.protocol}://${request.get("host")}`;

      let path = await this.uploadsService.uploadFile(startPathUrl, file);
      return this.teamsService.addImage(id, path);
    } else
      throw new ForbiddenException(
        "Вы имеете недостаточно прав в коллективе, обратитесь к руководителю"
      );
  }

  // @Post(':id/image')
  // @ApiOperation({ summary: "Загрузить изображение коллектива" })
  // @ApiParam({ name: "id", required: true, description: "Идентификатор коллектива" })
  // @ApiResponse({ status: HttpStatus.OK, description: "Успешно", type: Function })
  // @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  // @UseInterceptors(FileInterceptor('file'))
  // async addImsage(@Req() request: Request, @Param('id') id: number, @UploadedFile(new FileImageValidationPipe())
  // file: Express.Multer.File) {

  //   const startPathUrl = `${request.protocol}://${request.get('host')}`;

  //   let path = await this.uploadsService.uploadFile(startPathUrl, file)
  //   return this.teamsService.addImage(id, path);
  // }

  // @UseInterceptors(FileInterceptor('file'))
  // async uploadFile(@UploadedFile() file) {

  // requisition --------------------------------------------------------------------
  @Get("/:team_id/requisition")
  @ApiOperation({
    summary: "Получить список заявок в коллектив по ид колектива",
  })
  @ApiParam({
    name: "id",
    required: true,
    description: "Идентификатор коллектива",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Успешно",
    type: Function,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  async userRequisitionByTeam(
    @Param("team_id") team_id: number,
    @Query() reqDto: RequisitionDto
  ): Promise<Requisitions[]> {
    const requisitions = await this.teamsService.findAllRequisitions(
      team_id,
      reqDto
    );

    return requisitions;
  }

  @Get("requisition/:id")
  @ApiOperation({ summary: "Получить список заявок в коллектив по ид заявки" })
  @ApiParam({
    name: "id",
    required: true,
    description: "Идентификатор запроса",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Успешно",
    type: Function,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  async userRequisition(@Param("id") id: number): Promise<Requisitions> {
    const requisitions = await this.teamsService.findRequisition(id);

    return requisitions;
  }

  @Put("requisition/:id")
  @UseGuards(LocalAuthGuard, PermissionsGuard)
  @SetMetadata("permissions", ["can edit status requisitions"])
  @ApiOperation({ summary: "обновить заявку в коллектив" })
  @ApiParam({ name: "id", required: true, description: "Идентификатор" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Успешно",
    type: Function,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  async updateRequisition(
    @User() userId: number,
    @Param("id") req_id: number,
    @Body() updateRequisitionDto: RequisitionDto
  ) {
    const requisition = await this.teamsService.findRequisition(req_id);
    const hasPermissions = await this.usersService.hasPermissionsInTeam(
      userId,
      requisition.team.id,
      ["special"]
    );

    if (hasPermissions) {
      const requisitions = await this.teamsService.updateRequisition(
        req_id,
        updateRequisitionDto
      );
      return requisitions;
    } else
      throw new ForbiddenException(
        "Вы имеете недостаточно прав в коллективе, обратитесь к руководителю"
      );
  }

  @Get("requisitions/user/:userId")
  @ApiOperation({ summary: "Получить все заявки пользователя по его ID" })
  @ApiParam({
    name: "userId",
    required: true,
    description: "Идентификатор пользователя",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Успешно",
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  async getRequisitionsByUserId(
    @Param("userId") userId: number
  ): Promise<Requisitions[]> {
    const userRequisitions =
      await this.teamsService.findAllRequisitionsByUserId(userId);
    return userRequisitions;
  }

  // requisition --------------------------------------------------------------------
}
