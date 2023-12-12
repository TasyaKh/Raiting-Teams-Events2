<template>
  <div>
    <div class="top-bar row g-2 justify-content-between">
      <div class="col-md-5 col-sm-12">
        <SearchField :handle-timer-search="handleTimerSearch" />
      </div>
      <div class="col-md-auto col-sm-12">
        <select
          class="form-select"
          aria-label="Select by dates accept users"
          v-model="selectedParams.userDateInclude"
          @change="fetchUsers()"
        >
          <optgroup label="Дата вступления">
            <option
              v-for="date in selectParams.userDateInclude"
              :value="date"
              v-bind:key="date.id"
            >
              {{ date.name }}
            </option>
          </optgroup>
        </select>
      </div>
      <div class="col-md-2 col-sm-12">
        <SwitchToggle :on-event-change-state="handleEventChangeStateLayout" />
      </div>
    </div>

    <div class="row py-4">
      <div>{{ countParticipants }} участник</div>
      <div>{{ countLeaders }} руководитель</div>
    </div>

    <!--    error-->
    <div class="row">
      <div v-if="uFStore.apiRequest.error || teamStore.apiRequest.error">
        <div class="alert alert-danger" role="alert">
          {{ uFStore.apiRequest.error || teamStore.apiRequest.error }}
        </div>
      </div>
    </div>

    <div v-if="!isTable" class="members-list row g-2">
      <div
        v-for="item in teamUsers"
        class="col-md-12 col-lg-6"
        v-bind:key="item.id"
      >
        <div class="member-card border-block">
          <div class="row g-2">
            <div class="col-lg-auto col-md-auto col-sm-auto">
              <div class="image-container">
                <img
                  v-if="item.user?.image"
                  class="rounded-4"
                  :src="item.user?.image"
                  alt=""
                />
                <img
                  v-else
                  class="rounded-4"
                  src="@/assets/icon/avatar.png"
                  alt=""
                />
              </div>
            </div>

            <div class="col-lg col-md col-sm p-3">
              <!--            edit info-->
              <div class="row g-2 justify-content-end">
                <div class="col-auto">
                  <div
                    class="dropdown"
                    v-if="item.function?.title != TeamRoles.Leader"
                  >
                    <button
                      class="btn-icon"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <font-awesome-icon :icon="['fas', 'ellipsis']" />
                    </button>
                    <ul class="dropdown-menu">
                      <a
                        class="dropdown-item"
                        @click="isEditMode = !isEditMode"
                        href="javascript:"
                      >
                        <font-awesome-icon :icon="['fas', 'pencil']" />
                        Редактировать роль</a
                      >
                      <a
                        class="dropdown-item"
                        href="javascript:"
                        @click="
                          deleteUserFromTeam(
                            item.user?.id ?? -1,
                            Status.CANCELLED,
                          )
                        "
                      >
                        <font-awesome-icon :icon="['fas', 'trash']" />
                        Удалить участника</a
                      >
                    </ul>
                  </div>
                </div>
              </div>
              <!--            info about participant-->
              <div class="row g-2">
                <div class="col-12">
                  <div class="title">{{ item.user?.fullname }}</div>
                </div>
                <div class="col-12">
                  <div class="description">{{ item.function?.title }}</div>
                </div>
                <div class="col-12">
                  <div class="group">{{ item.user?.education_group }}</div>
                </div>
              </div>
            </div>
            <div v-if="isEditMode" class="p-3">
              <div class="row g-2">
                <label>Группа:</label>
                <input :value="item.user?.education_group" />
              </div>
              <div class="row g-2">
                <label>Роль:</label>
                <input :value="item.function?.title" />
              </div>
              <div class="row g-2 d-flex justify-content-end mt-3">
                <div class="col-auto">
                  <button
                    class="btn-custom-accept"
                    @click="
                      saveChanges(
                        item.user?.education_group ?? '',
                        item.function?.title ?? '',
                        item.user?.id ?? -1,
                      )
                    "
                  >
                    Сохранить
                  </button>
                </div>
                <div class="col-auto">
                  <button @click="cancelEditMode">Отмена</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!--    table -->
    <div v-if="isTable">
      <table class="table table-hover">
        <thead>
          <tr>
            <th scope="col">№</th>
            <th scope="col">ФИО</th>
            <th scope="col">Роль</th>
            <th scope="col">Группа</th>
            <th scope="col">Дата вступления</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(it, index) in teamUsers" v-bind:key="index">
            <th scope="row">{{ index + 1 + offset }}</th>
            <td>{{ it.user?.fullname }}</td>
            <td>{{ it.function?.title }}</td>
            <td>{{ it.user?.education_group }}</td>
            <td>
              <span v-if="it.dateCreate"
                >{{ new Date(it.dateCreate).toLocaleDateString() }}
              </span>
            </td>
            <!--            edit info-->
            <td>
              <div
                class="dropdown"
                v-if="it.function?.title != TeamRoles.Leader"
              >
                <button
                  class="btn-icon"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <font-awesome-icon :icon="['fas', 'ellipsis']" />
                </button>
                <ul class="dropdown-menu">
                  <a
                    class="dropdown-item"
                    @click="isEditMode = !isEditMode"
                    href="javascript:"
                  >
                    <font-awesome-icon :icon="['fas', 'pencil']" />
                    Редактировать роль</a
                  >
                  <a
                    class="dropdown-item"
                    href="javascript:"
                    @click="
                      deleteUserFromTeam(it.user?.id ?? -1, Status.CANCELLED)
                    "
                  >
                    <font-awesome-icon :icon="['fas', 'trash']" />
                    Удалить участника</a
                  >
                </ul>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <PaginationElem
      :max-page="maxPages"
      :visible-pages="visiblePages"
      :handleEventChangePage="handleEventChangePage"
    />
  </div>
</template>

<script setup lang="ts">
// import PaginationElem from "@/components/PaginationElem.vue";
import { useTeamStore } from "@/store/team_store";
import { onBeforeMount, ref } from "vue";
import { useFunctionsStore } from "@/store/fucntion_store";
import { TeamRoles } from "@/store/enums/team_roles";
import type { IUserFunction } from "@/store/models/user/user-functions.model";
import SwitchToggle from "@/components/SwitchToggle.vue";
import type { Ref } from "vue";
import SearchField from "@/components/SearchField.vue";
import type { IRUFunction } from "@/store/models/user/search-user-functions.model";
import PaginationElem from "@/components/PaginationElem.vue";
import type { RURequisition } from "@/store/models/teams/update-requisition.model";
import { useUserFunctionsStore } from "@/store/user_functions.store";
import { Status } from "@/store/enums/enum_event";

const teamStore = useTeamStore();
const uFStore = useUserFunctionsStore();
const userStore = useFunctionsStore();

const props = defineProps<{
  idTeam: number;
}>();

//pagination ---------------------------------------------------------------------
const limit = 5; //сколько отображается на странице
const offset = ref(0); //сколько пропустить прежде чем отобрад+зить

const maxPages = ref(1);
const visiblePages = 7;
//pagination ---------------------------------------------------------------------

const isTable = ref(false);
const isEditMode = ref(false);
const teamUsers: Ref<IUserFunction[]> = ref([]);
const countParticipants = ref(0);
const countLeaders = ref(0);

const searchTxt = ref("");

const filter: Ref<IRUFunction> = ref({});
// выбранные параметры
const selectParams = ref({
  userDateInclude: [
    { id: 0, name: "Сначала недавно вступившие", order: "ASC" },
    { id: 1, name: "Сначала давно вступившие", order: "DESC" },
  ],
});

// выбранные параметры
const selectedParams = ref({
  userDateInclude: selectParams.value.userDateInclude[0],
});

onBeforeMount(async () => {
  filter.value.offset = offset.value;
  filter.value.limit = limit;
  await fetchUsers();
});

function handleEventChangeStateLayout(stateL: boolean) {
  isTable.value = !stateL;
}

async function saveChanges(
  education_group: string,
  title_role: string,
  id: number,
) {
  await userStore.update(education_group, title_role, id);
  isEditMode.value = false;
}

// async function handleDeleteMemberEvent() {
//   await fetchUsers();
// }

async function fetchUsers() {
  filter.value.date_create_order = selectedParams.value.userDateInclude.order;
  filter.value.searchTxt = searchTxt.value;
  const data = await teamStore.fetchUsersOfTeam(props.idTeam, filter.value);

  teamUsers.value = data[0];
  const count = data[1];
  maxPages.value = count >= limit ? Math.ceil(count / limit) : 1;

  await countPeople(teamUsers.value);
}

async function countPeople(teamUsers: IUserFunction[]) {
  let cParticipants = 0;
  let cLeaders = 0;
  teamUsers.forEach((uF) => {
    if (uF.function?.title == TeamRoles.Member) cParticipants++;
    else if (uF.function?.title == TeamRoles.Leader) cLeaders++;
  });

  countParticipants.value = cParticipants;
  countLeaders.value = cLeaders;
}

async function deleteUserFromTeam(userId: number, status_name: string) {
  let requis: RURequisition = {};
  requis.team_id = props.idTeam;
  requis.user_id = userId;

  // заявка меняет статус
  let requisitions = await teamStore.fetchRequisitions(requis);

  if (requisitions && requisitions[0]?.id) {
    let requis: RURequisition = {};
    requis.id = requisitions[0].id;
    requis.status_name = status_name;

    await teamStore.updateRequisition(requis);
  }

  // remove user functions
  let uFs = await uFStore.findUserFunctions(props.idTeam, userId);

  for (const uF of uFs) {
    // удалить роль в коллективе
    await uFStore.removeUserFunction(uF.id);
  }

  await fetchUsers();
}

async function cancelEditMode() {
  isEditMode.value = false;
}

async function handleTimerSearch(seachText: string) {
  searchTxt.value = seachText;
  await fetchUsers();
}

async function handleEventChangePage(currentPage: number) {
  offset.value = (currentPage - 1) * limit;
  filter.value.offset = offset.value;

  await fetchUsers();
}
</script>

<style scoped lang="scss">
.block {
  padding: 7px 15px;
  border: 1.5px solid rgba(61, 61, 61, 0.1);
  border-radius: 15px;
}

.view-selection {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border: 1.5px solid rgba(61, 61, 61, 0.1);
  border-radius: 15px;
}

.order {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.search {
  .icon {
    margin-right: 10px;
  }

  display: flex;
  align-items: center;
}

.member-card {
  overflow: hidden;

  img {
    height: 200px;
    width: 200px;
    object-fit: cover;
    overflow: hidden;
  }

  @media screen and (max-width: 576px) {
    img {
      display: none;
    }
  }

  .date {
    text-align: right;
    font-weight: bold;
    font-size: 10px;
    color: #7d7d7d;
  }

  .title {
    font-weight: bold;
    font-size: 16px;
    margin-bottom: 10px;
  }

  .description {
    text-align: justify;
    font-size: 13px;
  }

  .group {
    text-align: justify;
    font-size: 13px;
  }

  .text-container {
    flex: 1;
    padding: 25px;
  }
}
</style>
