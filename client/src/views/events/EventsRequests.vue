<template>
  <!-- dropdowns -->
  <div class="row my-3">
    <div class="col-auto">
      <label class="form-label fw-bold">Направление</label>
      <select
        class="form-select"
        aria-label="Direction"
        v-model="selectedDirection"
        @change="fetchEvents()"
      >
        <option
          v-for="direction in directions"
          :value="direction.id"
          v-bind:key="direction.id"
        >
          {{ direction.name }}
        </option>
      </select>
    </div>

    <div class="col-auto">
      <label class="form-label fw-bold">Статус</label>
      <select
        class="form-select"
        aria-label="Status"
        v-model="selectedStatus"
        @change="fetchEvents()"
      >
        <option v-for="st in status" :value="st.id" v-bind:key="st.id">
          {{ st.name }}
        </option>
      </select>
    </div>
  </div>

  <!-- cards of events -->
  <div class="row">
    <div class="events-requests__wrapper">
      <div v-if="events.length <= 0" class="alert alert-warning" role="alert">
        Заявок нет
      </div>

      <div v-else v-for="event in events" v-bind:key="event.id">
        <!-- карточка -->
        <CardApprove
          :positive-border-color="
            event.status && event.status.name == Status.ACCEPTED
          "
        >
          <template #title>
            {{ event.title }}
          </template>

          <template #time>
            <span v-if="event.date_update"
              >{{ new Date(event.date_update).toLocaleDateString() }}
            </span>
          </template>

          <template #body>
            <!-- initiator -->
            <div class="row">
              <!-- Инициатор -->
              <div class="col-auto">
                <div class="style-elem">Инициатор:</div>
              </div>
              <div class="col-auto">
                {{ event.user ? event.user.fullname : "-" }}
              </div>

              <div class="col-auto">
                <!-- email -->
                <div class="style-elem">email:</div>
              </div>
              <div class="col-auto">
                {{ event.user ? event.user.email : "-" }}
              </div>

              <!-- тел -->
              <div class="col-auto">
                <div class="style-elem">тел:</div>
              </div>
              <div class="col-auto">
                {{ event.user ? event.user.phone : "-" }}
              </div>
            </div>

            <div class="row">
              <div class="col-auto">
                <div class="style-elem">Уровень:</div>
              </div>
              <div class="col-auto">
                {{ event.level ? event.level.name : "-" }}
              </div>
            </div>

            <div class="row">
              <div class="col-auto">
                <div class="style-elem">Формат проведения:</div>
              </div>
              <div class="col-auto">
                {{ event.format ? event.format.name : "-" }}
              </div>
            </div>
            <div class="row">
              <div class="col-auto">
                <div class="style-elem">Количество участников:</div>
              </div>
              <div class="col-auto">{{ event.count_people ?? "-" }}</div>
            </div>
            <div class="row">
              <div class="col-auto">
                <div class="style-elem">Даты начала/окончания:</div>
              </div>
              <div class="col-auto">
                <span v-if="event.dateStart"
                  >{{ new Date(event.dateStart).toLocaleDateString() }}
                </span>
                -
                <span v-if="event.dateEnd"
                  >{{ new Date(event.dateEnd).toLocaleDateString() }}
                </span>
              </div>
            </div>
          </template>

          <template #link>
            <router-link :to="'/event/' + event.id">
              <a href="#">Подробнее &rarr;</a>
            </router-link>
          </template>

          <template #footer>
            <div class="col-auto">
              <div class="fw-bold">Статус:</div>
            </div>
            <div class="col-auto">
              <div v-if="event.status && event.status.name == Status.ACCEPTED">
                <font-awesome-icon icon="check-circle" class="text-success" />
                принято
              </div>
              <div
                v-else-if="
                  event.status && event.status.name == Status.CANCELLED
                "
              >
                <font-awesome-icon icon="circle-xmark" class="text-danger" />
                отклонено
              </div>
              <div v-else>
                <font-awesome-icon icon="clock" />
                в ожидании
              </div>
            </div>
          </template>

          <template #buttons>
            <div class="col d-flex justify-content-end">
              <button
                class="button btn-custom-accept"
                @click="changeStatus(event.id ?? -1, Status.ACCEPTED)"
              >
                принять
              </button>
            </div>
            <div class="col-auto">
              <button
                class="button"
                @click="changeStatus(event.id ?? -1, Status.CANCELLED)"
              >
                отклонить
              </button>
            </div>
          </template>
        </CardApprove>
      </div>
    </div>
  </div>

  <div class="row">
    <Pagination
      :max-page="maxPages"
      :visible-pages="visiblePages"
      :handleEventChangePage="handleEventChangePage"
    />
  </div>
</template>

<script setup lang="ts">
import Pagination from "@/components/PaginationElem.vue";
import { useEventStore } from "@/store/events_store";
import { useEventStore as useSingleEvent } from "@/store/event_store";
import { DIRECTION } from "@/store/constants/constants_class_names";

import { onBeforeMount, ref } from "vue";
import type { Ref } from "vue";

import { useDictionaryStore } from "@/store/dictionary_store";
import CardApprove from "@/components/CardApprove.vue";
import { Status, Type } from "@/store/enums/enum_event";
import type { IEvent, IEventSearch } from "@/store/models/event/events.model";

const eventsStore = useEventStore();
const singleEvent = useSingleEvent();
const dictionaryStore = useDictionaryStore();

const events: Ref<IEvent[]> = ref([]);
const directions = ref([{ id: 0, name: "Все" }]);
const status = [
  { id: 0, name: "Принятные", value: Status.ACCEPTED },
  { id: 1, name: "Отклоненные", value: Status.CANCELLED },
  { id: 2, name: "В рассмотрении", value: Status.CREATED },
  { id: 3, name: "Все", value: Status.ALL },
];

// загрузка
const loading = ref(false);

// dropdowns
const selectedDirection = ref(0);
const selectedStatus = ref(2);

//pagination ---------------------------------------------------------------------
let limit = 5; //сколько  отображается на странице
const offset = ref(0); //сколько  пропустить прежде чем отобразить

const maxPages = ref(1);
const visiblePages = 7;
//pagination ---------------------------------------------------------------------

onBeforeMount(async () => {
  directions.value =
    await dictionaryStore.getFromDictionaryByClassID(DIRECTION);
  directions.value.unshift({ id: 0, name: "Все" });

  await fetchEvents();
});

async function fetchEvents() {
  loading.value = true;

  const sDirection =
    selectedDirection.value > 0 ? selectedDirection.value : null;

  let event: IEventSearch = {
    limit: limit,
    offset: offset.value,
    type: Type.OUTSIDE,
    status: status[selectedStatus.value].value,
    direction: sDirection ?? undefined,
  };

  let d = await eventsStore.fetchEvents(event);
  events.value = d[0] as IEvent[];

  const eventsCount = d[1];
  maxPages.value = eventsCount >= limit ? Math.ceil(eventsCount / limit) : 1;
  loading.value = false;
}

async function handleEventChangePage(currentPage: number) {
  offset.value = (currentPage - 1) * limit;

  await fetchEvents();
}

async function changeStatus(id: number, status: Status) {
  await singleEvent.updateEvent(id, status);
  await fetchEvents();
}
</script>

<style lang="scss" scoped>
.events-requests__wrapper {
  .style-elem {
    color: var(--second-color);
  }
}
</style>
