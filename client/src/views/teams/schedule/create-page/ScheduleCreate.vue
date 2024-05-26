<template>
  <div class="schedule-create">
    <header>
      <h1 class="text-uppercase">
        Добавление занятия в расписание коллектива “{{ shedule.teamName }}”
      </h1>
    </header>
    <section class="class-options px-5 mt-sm-5">
      <span class="fw-bold pt-2 my-2">День недели:</span>
      <select
        class="col form-select week-day-select"
        v-model="classForm.dayOfTheWeek"
      >
        <option v-for="(day, i) in WeekDay" :key="day" :value="day">
          {{ WeekDayRu[i] }}
        </option>
      </select>
      <span class="fw-bold pt-4">Добавление занятия:</span>
      <div class="switch border-block mt-3">
        <div
          v-for="(periodOption, i) in PeriodOption"
          :key="periodOption"
          @click="setState(periodOption)"
          class="switch-item"
          :class="{ active: classForm.period === periodOption }"
        >
          {{ PeriodOptionRU[i] }}
        </div>
      </div>
    </section>
    <section class="class-booking-wrapper">
      <ClassBooking
        v-for="data in classBooking"
        :key="data.header"
        :header="data.header"
        :isPrimary="data.isPrimary"
        :date="data.date"
        :location="data.location"
      ></ClassBooking>
    </section>
    <section class="mt-sm-4">
      <div class="filters">
        <GroupElements class="me-3">
          <span option>
            <font-awesome-icon :icon="['fas', 'star']" />
            <span class="star__count ps-sm-2">{{ starCount }}</span>
          </span>
          <span option>
            <font-awesome-icon :icon="['fas', 'fa-cog']" />
          </span>
        </GroupElements>
        <GroupElements class="me-3">
          <span option>
            <font-awesome-icon :icon="['fas', 'fa-calendar']" />
          </span>
          <span option no-divider> Свободные </span>
        </GroupElements>
        <GroupElements class="me-3">
          <span option> Тип </span>
          <span option>
            <select class="form-select">
              <option>Все</option>
              <option>Для занятий вокалом</option>
              <option>Для занятий хореографией</option>
              <option>Со сценой</option>
              <option>С муз. инструментами</option>
              <option>Доступные без ключа</option>
              <option>Компьютерные</option>
              <option>С проектором</option>
              
            </select>
          </span>
        </GroupElements>
        <GroupElements class="me-3">
          <span option> Корпус </span>
          <span option>
            <select class="form-select">
              <option>Другие</option>
              <option>2</option>
              <option>3</option>
              <option>7</option>
              <option>8</option>
              <option>10</option>
              <option>А</option>
              <option>Б</option>
              <option>В</option>
              <option>Г</option>
              <option>Д</option>
              <option>Е</option>
              <option>Ж</option>
              <option>И</option>
              <option>К</option>
              <option>М</option>
              <option>П</option>
              <option>Т</option>
            </select>
          </span>
        </GroupElements>
        <GroupElements class="me-3">
          <span option>
            <font-awesome-icon :icon="['fas', 'fa-users']" />
          </span>
          <span option>
            <select class="form-select">
              <option>Любая</option>
            </select>
          </span>
        </GroupElements>
        <button>
          <font-awesome-icon :icon="['fas', 'fa-refresh']" />
          Сброс
        </button>
      </div>
      <div class="filter-enabled">задействован фильтр</div>
      <div class="class-list-card-wrapper">
        <ClassListCard
          v-for="(el, i) in classLists"
          :key="i"
          :disabled="el.disabled"
          :num="i + 1"
          :time="el.time"
          :list="el.list"
          :repeat="classForm.period == PeriodOption.EVERYWEEK"
          :team-name="shedule.teamName"
        ></ClassListCard>
      </div>
    </section>
    <!--    <button-->
    <!--      type="button"-->
    <!--      data-bs-toggle="modal"-->
    <!--      data-bs-target="#createScheduleSubmitModal"-->
    <!--    >-->
    <!--      SUBMIT-->
    <!--    </button>-->
    <!--    <SubmitModal-->
    <!--      :date="new Date()"-->
    <!--      :union="shedule.name"-->
    <!--      :location="'актовый зал'"-->
    <!--    ></SubmitModal>-->
  </div>
</template>

<script setup lang="ts">
import { WeekDay, WeekDayRu } from "@/common/date/week-day.enum";
import { PeriodOption, PeriodOptionRU } from "./period-option.enum";
import { onBeforeMount, ref } from "vue";
import GroupElements from "@/common/group-elements/GroupElements.vue";
import ClassBooking from "./ClassBooking.vue";
import ClassListCard from "./ClassListCard.vue";
import { useAuditoriesStore } from "@/store/schedule/cabinets_store";
import type { ICabinet } from "@/store/models/schedule/cabinet.model";
import type { ICabinetsSearch } from "@/store/models/schedule/schedule.model";
import { useRoute } from "vue-router";
import type {
  ClassList,
} from "@/views/teams/schedule/create-page/ClassListCard.interface";

const starCount = 1;

const route = useRoute();

// const teamId = Number(route.params.team_id);
const time = ref(String(route.query.time).slice(0, 5));
// const date = ref(String(route.query.date));

const shedule = ref({
  teamName: String(route.query.team_name),
});

const classForm = ref({
  dayOfTheWeek: WeekDay.MONDAY,
  period: PeriodOption.ONCE,
});

const auditsStore = useAuditoriesStore();
const cabinetsSearch = ref<ICabinetsSearch>({});

const classLists = ref<ClassList[]>([]);

onBeforeMount(() => {
  getCabinets();
  cabinetsSearch.value.free_time = time.value;
});


// TODO: вынести в туллтинг
const weekInSec = 1000 * 60 * 60 * 24 * 7;
const nowDateInSec = Date.now();
const getDate = (v: number | string | Date): Date => new Date(v);
const classBooking = [
  {
    header: "текущая неделя",
    isPrimary: true,
    date: new Date(),
    location: "Зал вокала",
  },
  {
    header: "следующая неделя",
    isPrimary: false,
    date: getDate(nowDateInSec + weekInSec),
    location: "",
  },
  {
    header: "последующая неделя",
    isPrimary: false,
    date: getDate(nowDateInSec + weekInSec * 2),
    location: "",
  },
];

function setState(v: PeriodOption) {
  classForm.value.period = v;
}

async function getCabinets() {
  let data = await auditsStore.getCabinets(cabinetsSearch.value);
  let cabinets = data.cabinets;
  let list: { starred: boolean; title: string; points: number; id: number }[] =
    [];
  cabinets.forEach((cab: ICabinet) => {
    list.push({
      starred: false,
      id: cab.id,
      title: cab.name,
      points: cab.people_count,
    });
  });

  // TODO: доработаьть вывод аудиторий
  for (let i = 0; i < 3; i++) {
    classLists.value.push({
      disabled: i == 2,
      time: time.value,
      list: list,
    });
  }
}
</script>

<style lang="scss" scoped>
header {
  box-shadow: none;
}

.schedule-create {
  background-color: #ffffff;
  border: var(--border-block);
  border-radius: 5px;
  padding: 15px 25px;
}

.week-day-select {
  height: 39px;
}

h1 {
  font-style: var(--font-family-title);
  font-weight: 600;
  font-size: 24px;
  text-align: center;
}

.class-options {
  --options-font-color: #747474;
  display: grid;
  grid-template-columns: 270px minmax(200px, 300px);
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0em;
  text-align: left;
  color: var(--options-font-color);
  align-items: center;
}

.class-booking-wrapper {
  display: flex;
}

// TODO: move switch as common component
.switch {
  --switch__bg-color: #ffffff;
  --switch__active_bg-color: #d9d9d9;

  display: flex;
  align-items: center;
  text-align: center;
  background-color: var(--switch__bg-color);
  border-radius: 24px;

  .switch-item {
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 35px;
    width: 100%;
    transition: 0.4s;

    &:first-child {
      border-top-left-radius: 24px;
      border-bottom-left-radius: 24px;
    }

    &:last-child {
      border-top-right-radius: 24px;
      border-bottom-right-radius: 24px;
    }
  }

  .active {
    color: #383838;
    background-color: var(--switch__active_bg-color);
  }
}

:deep(.class-booking:first-child) .class-booking__header {
  border-left: 1px solid #000000;
}

.filters {
  margin-bottom: 25px;
}

.filter-enabled {
  --filter-enabled__color: #af1e3b;

  border: 1px solid var(--filter-enabled__color);
  color: var(--filter-enabled__color);
  text-align: center;
  text-transform: uppercase;
  margin-bottom: 25px;

  font-style: var(--font-family-title);
  font-weight: 600;
  font-size: 16px;

  padding: 5.5px 0;
  line-height: normal;
}

.class-list-card-wrapper {
  display: flex;
}
</style>
