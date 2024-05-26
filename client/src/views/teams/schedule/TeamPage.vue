<template>
  <!--    calendar-->
  <div class="my-3" style="width: max-content">
    <ModalsChedule/>
    <DropdownBtn>
      <template #img>
        <FontAwesomeIcon icon="calendar" />
      </template>
      <template #title>{{ selectedWeekStart.toLocaleDateString() }}</template>
      <template #body>
        <DatePicker v-model="selectedWeekStart" />
      </template>
    </DropdownBtn>
  </div>
  <!--    buttons-->
  <div class="row">
    <div class="col-12">
      <div class="d-flex justify-content-between mb-3">
        <button @click="prevWeek" class="btn-custom-neutral">
          <FontAwesomeIcon icon="chevron-left" class="me-3" />
          Предыдущая неделя
        </button>
        <h4 class="text-center">{{ dates.formattedDate }}</h4>
        <button @click="nextWeek" class="btn-custom-neutral">
          Следующая неделя
          <FontAwesomeIcon class="ms-3" icon="chevron-right" />
        </button>
      </div>
    </div>
  </div>

  <!--    schedule-->
  <div class="row my-3">
    <TeamSchedule :dates="dates" :team-id="teamId"  :team-name="teamName"/>
  </div>
  <!--    visits-->
  <div class="row">
    <TeamVisits />
  </div>
</template>

<script lang="ts" setup>
import TeamSchedule from "@/views/teams/schedule/TeamSchedule.vue";
import TeamVisits from "@/views/teams/schedule/TeamVisits.vue";
import {
  getFormattedWeek,
  getMonday,
} from "@/views/teams/schedule/format-date";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { computed, ref } from "vue";
import { DatePicker } from "v-calendar";
import DropdownBtn from "@/components/Buttons/DropdownBtn.vue";
import ModalsChedule from "@/components/modals/ModalsChedule.vue";

defineProps<{
  teamId: number;
  teamName:string;
}>();

const selectedWeekStart = ref(getMonday(new Date())); // Используем функцию для получения понедельника

const weekDays = computed(() => {
  const days: Date[] = [];
  const startDate = new Date(selectedWeekStart.value);
  for (let i = 0; i < 7; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    days.push(day);
  }
  return days;
});

const dates = computed(() => {
  return getFormattedWeek(
    weekDays.value[0],
    weekDays.value[weekDays.value.length - 1],
  );
});

function prevWeek() {
  selectedWeekStart.value = new Date(
    selectedWeekStart.value.getTime() - 7 * 24 * 60 * 60 * 1000,
  );
}

function nextWeek() {
  selectedWeekStart.value = new Date(
    selectedWeekStart.value.getTime() + 7 * 24 * 60 * 60 * 1000,
  );
}
</script>

<style lang="scss" scoped>
h3 {
  color: #959595;
}
</style>
