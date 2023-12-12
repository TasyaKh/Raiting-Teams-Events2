<template>
  <!-- Modal -->
  <div
    class="modal fade bd-example-modal-lg"
    id="exampleModal"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content px-3 py-4">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="exampleModalLabel">
            <!-- редактирование или создание нвого колелктива -->
            <b v-if="isEditTeam"> Редактировать коллектив </b>
            <b v-else>Создать коллектив </b>

            <!-- если коллектив в архиве -->
            <sup
              v-if="
                teamObj != null &&
                teamObj.is_archive != null &&
                teamObj.is_archive
              "
              class="text-bg-danger"
            >
              (В архиве)</sup
            >
            <!-- если он действующий -->
            <sup v-else-if="teamObj != null" class="text-bg-success">
              (действующий)</sup
            >
          </h1>
          <div
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></div>
        </div>
        <div class="modal-body">
          <!-- Это вся обертка -->

          <div class="wrapper-team__create">
            <div v-if="!isEditTeam" class="alert alert-primary" role="alert">
              Прежде чем создать в системе новый коллектив, нужно утвердить его
              приказом!
            </div>

            <div v-if="responseMsg" class="alert alert-warning" role="alert">
              {{ responseMsg }}
            </div>

            <!-- Форма с полями для создания -->
            <form
              class="form-team__create"
              @submit.prevent="isEditTeam ? updateTeam() : createTeam()"
            >
              <div class="create-filds">
                <div class="filds-area">
                  <input
                    type="text"
                    placeholder="Название коллектива"
                    v-model="title"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Краткое название"
                    v-model="shortname"
                    required
                  />

                  <v-select
                    placeholder="ФИО Руководителя или email"
                    class="v-select"
                    label="data"
                    @input="onTextChange"
                    :options="foundUsers"
                    v-model="optionSelect"
                  ></v-select>

                  <div class="row">
                    <div class="col-auto">
                      <!-- select direction -->
                      <select
                        class="form-select mb-3"
                        style="min-width: 80px"
                        aria-label="Default select example"
                        v-model="selectedDirection"
                      >
                        <option
                          v-for="direction in directions"
                          :value="direction.id"
                          v-bind:key="direction.id"
                        >
                          {{ direction.shortname }}
                        </option>
                      </select>
                    </div>

                    <div class="col">
                      <input
                        type="text"
                        style="width: max-content"
                        placeholder="Аудитория(кабинет)"
                        v-model="cabinet"
                      />
                    </div>
                  </div>

                  <div class="mb-2">
                    <label for="formFile" class="form-label"
                      >загрузить устав</label
                    >
                    <input
                      class="form-control"
                      type="file"
                      id="formFile"
                      @change="(e) => handleFileUpload(e, false)"
                    />
                    <p v-if="isEditTeam && teamObj != null">
                      {{ teamObj.charter_team }}
                    </p>
                    <img
                      v-if="isEditTeam"
                      :src="charterTeamBase64"
                      style="width: 100px; height: 100px"
                      alt="Устав"
                    />
                  </div>

                  <div class="mb-2">
                    <label for="formFile1" class="form-label"
                      >загрузить документ(ы)</label
                    >
                    <input
                      class="form-control"
                      type="file"
                      id="formFile1"
                      @change="(e) => handleFileUpload(e, true)"
                    />
                    <p v-if="isEditTeam && teamObj != null">
                      {{ teamObj.document }}
                    </p>
                  </div>

                  <textarea
                    placeholder="Описание"
                    v-model="description"
                    required
                  ></textarea>
                </div>

                <div class="fuck-off-btn">
                  <div class="row">
                    <div class="col">
                      <button type="submit">Сохранить коллектив</button>
                    </div>
                    <div class="col-auto" v-if="isEditTeam">
                      <button
                        type="button"
                        class="btn btn-secondary"
                        @click="
                          archiveTeam(
                            teamObj?.id ?? -1,
                            teamObj?.is_archive ?? false,
                          )
                        "
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="Архивировать коллектив"
                      >
                        <font-awesome-icon icon="archive" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, watch } from "vue";
import _ from "lodash";
import { useTeamStore } from "@/store/team_store";
import { useUserStore } from "@/store/user_store";
import UpdateTeam from "./UpdateTeam";
import type { Ref } from "vue";
import type { ITeam } from "@/store/models/teams/team.model";
import { TeamRoles } from "@/store/enums/team_roles";
import { FilterUser } from "@/store/models/user.model";

const teamStore = useTeamStore();

const props = defineProps<{
  isEditTeam: boolean; //если модальное окно вызвано для редактирования (не создание нового коллектива)
  teamId: number;
  onSaveChanges: () => void;
}>();

const teamObj: Ref<ITeam> = ref({});

// values from form
const title = ref("");
const shortname = ref("");
const userLeader = ref();
const cabinet = ref("");

// const charterTeamImg = ref();
// const document = ref();

const description = ref("");

// files
const charterTeamFile = ref();
const documentFile = ref();

const charterTeamBase64 = ref();

const oldUserId = ref(-1);

// сообщение об ошибках
const responseMsg = ref();

// найденные юзеры
const foundUsers = ref();

// найденные направления из системы
const directions = ref([{ id: 0, shortname: "Все" }]); //дата
const selectedDirection = ref(0);

//получить юзеров
const timerFetchUsers = _.debounce(() => {
  getUsers();
}, 300);

const optionSelect = ref();

const teamLeaders = ref();

//отслеживать изменение текста для v-select
async function onTextChange(e: InputEvent) {
  const el = e.target as HTMLInputElement;
  userLeader.value = el.value;
  optionSelect.value = null;
  timerFetchUsers();
}

watch(
  () => props.teamId,
  async (value) => {
    if (value) await fetchTeam(value);

    responseMsg.value = "";
    await fillForm();
  },
);

async function fetchTeam(id: number) {
  if (id) {
    teamObj.value = await teamStore.fetchTeam(id);
  } else teamObj.value = {};

  responseMsg.value = "";

  teamLeaders.value = getLeader(teamObj.value);

  await fillForm();
}

onBeforeMount(async () => {
  await getUsers();

  await getDirections();
});

async function getDirections() {
  let data = await teamStore.fetchDirections();

  let dir = data[0];
  let arrayData = [];
  arrayData[0] = { id: 0, shortname: "Все" };

  for (let i = 0; i < dir.length; i++) {
    arrayData[i + 1] = dir[i];
  }

  directions.value = arrayData;
}

// заполнить форму данными
async function fillForm() {
  // make files is empty
  charterTeamFile.value = null;
  documentFile.value = null;

  if (teamObj.value) {
    let t = teamObj.value;

    selectedDirection.value = t.id_parent ? t.id_parent.id ?? 0 : 0;
    title.value = t.title ?? "";
    shortname.value = t.shortname ?? "";
    description.value = t.description ?? "";
    cabinet.value = t.cabinet ?? "";

    //если есть руководитель коллектива

    let uF = teamLeaders.value[0];
    if (uF) {
      optionSelect.value = {
        name: uF.fullname,
        email: uF.email,
        id: uF.id,
        data: uF.fullname + " " + uF.email,
      };

      oldUserId.value = uF.id ?? -1;
    } else {
      optionSelect.value = null;
    }
  } else {
    //если коллектив не задан , то очистить все поля
    title.value = shortname.value = description.value = cabinet.value = "";
    optionSelect.value = null;
    selectedDirection.value = 0;
  }
}

// получить всех пользователей и выбрать из них нужных
async function getUsers() {
  let filterUser = new FilterUser();
  filterUser.limit = 5;
  filterUser.searchTxt = userLeader.value;
  let r = await useUserStore().getUsersByNameEmail(filterUser);

  //получить всех найденных юзеров
  let users = r.data[0];

  let arrayData = [];
  for (let i = 0; i < users.length; i++) {
    let user = users[i];

    arrayData[i] = {
      name: user.fullname,
      email: user.email,
      id: user.id,
      data: `${user.fullname} ${user.email}`,
    };
  }
  foundUsers.value = arrayData;
}

//создать коллектив
async function createTeam() {
  let userId = -1;
  //проверить является id числом или нет и выбрана ли опция

  userId = optionSelect.value.id;

  //create team
  await teamStore
    .createTeam(
      selectedDirection.value,
      title.value,
      description.value,
      shortname.value,
      userId,
      cabinet.value,
      charterTeamFile.value,
      documentFile.value,
    )
    .then((msg) => {
      if (msg) responseMsg.value = msg;
      else {
        responseMsg.value = "Сохранено";
        props.onSaveChanges();
      }
    });
}

// обночить коллектив
async function updateTeam() {
  let newUserId = -1;
  //проверить является id числом или нет и выбрана ли опция

  newUserId = optionSelect.value ? optionSelect.value.id : -1;

  //create team
  const uT = new UpdateTeam();
  uT.id_parent = selectedDirection.value;
  uT.cabinet = cabinet.value;
  uT.description = description.value;
  uT.id = teamObj.value.id ?? -1;
  uT.oldUserId = oldUserId.value;
  uT.newUserId = newUserId;
  uT.shortname = shortname.value;
  uT.title = title.value;
  uT.documentPath = teamObj.value.document ?? "";
  uT.charterPath = teamObj.value.charter_team ?? "";
  // files
  uT.fileUstav = charterTeamFile.value;
  uT.fileDocument = documentFile.value;

  await teamStore.updateTeam(uT).then((res) => {
    if (res.responseMsg) responseMsg.value = res.responseMsg;
    else {
      responseMsg.value = "Сохранено";
      teamObj.value = res.team?.data;
      props.onSaveChanges();
    }
  });
}

async function handleFileUpload(event: Event, document: boolean) {
  const files = (event.target as HTMLInputElement).files;
  if (files) {
    const file = files[0];
    if (!document) charterTeamFile.value = file;
    else {
      documentFile.value = file;
    }
  }
}

// архивировать коллектив
async function archiveTeam(id: number, isArchive: boolean) {
  let res = await teamStore.archiveTeam(id, isArchive);
  responseMsg.value = res.responseMsg;

  if (res.isOK) teamObj.value.is_archive = isArchive;
}

function getLeader(team: ITeam) {
  const leaders = [];
  if (!team || !team.functions) return [];
  for (let i = 0; i < team.functions.length; i++) {
    const func = team.functions[i];
    if (func.title === TeamRoles.Leader && func.userFunctions) {
      for (let io = 0; io < func.userFunctions?.length; io++) {
        const userFunc = func.userFunctions[io];
        leaders.push(userFunc.user);
      }
    }
  }

  return leaders;
}
</script>

<style lang="scss" scoped>
.btn-close {
  &:hover {
    background-color: var(--main-color-hover);
    transition: 0.3s;
  }
}

.wrapper-team__create {
  .form-team__create {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    border-radius: 15px;
    border: var(--main-border-card);

    .fuck-off-btn {
      display: flex;
      justify-content: end;
    }

    .create-filds {
      display: block;
      padding: 2rem;
      width: 100%;

      .filds-area {
        display: flex;
        flex-direction: column;

        .v-select {
          padding-bottom: 1rem;
        }

        textarea {
          min-height: 20%;
          min-width: 100%;
          max-width: max-content;
          margin-bottom: 1rem;
          font-family:
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            Oxygen,
            Ubuntu,
            Cantarell,
            "Open Sans",
            "Helvetica Neue",
            sans-serif;
        }

        input {
          margin-bottom: 1rem;
        }
      }
    }
  }
}
</style>
