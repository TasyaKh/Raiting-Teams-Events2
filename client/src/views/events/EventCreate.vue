<template>
  <div class="eventInfo row">
    <div class="margins-edit row">
      <p class="text-edit">Название мероприятия</p>
      <input placeholder="edit me" v-model="title" />
    </div>
    <div class="margins-edit row">
      <p class="text-edit">Описание</p>
      <input placeholder="edit me" v-model="description" />
    </div>

    <div class="margins-edit datePickers row">
      <div class="col ps-0">
        <div class="row">
          <p class="text-edit" style="text-align: center">
            Дата начала мероприятия
          </p>
        </div>
        <div class="row">
          <VueDatePicker
            locale="ru"
            v-model="dateStart"
            placeholder="Start Typing ..."
            text-input
          ></VueDatePicker>
        </div>
      </div>
      <div class="col">
        <div class="row">
          <p class="text-edit" style="text-align: center">
            Дата окончания мероприятия
          </p>
        </div>
        <div class="row">
          <VueDatePicker
            locale="ru"
            v-model="dateEnd"
            placeholder="Start Typing ..."
            text-input
          ></VueDatePicker>
        </div>
      </div>
      <div class="col">
        <div class="row">
          <p class="text-edit" style="text-align: center">
            Дата начала регистрации
          </p>
        </div>
        <div class="row">
          <VueDatePicker
            locale="ru"
            v-model="dateStartRegistration"
            placeholder="Start Typing ..."
            text-input
          ></VueDatePicker>
        </div>
      </div>
      <div class="col pe-0">
        <div class="row">
          <p class="text-edit" style="text-align: center">
            Дата окончания регистрации
          </p>
        </div>
        <div class="row">
          <VueDatePicker
            locale="ru"
            v-model="dateEndRegistration"
            placeholder="Start Typing ..."
            text-input
          ></VueDatePicker>
        </div>
      </div>
    </div>
    <div class="margins-edit row">
      <p class="text-edit">Цель проведения</p>
      <input placeholder="edit me" v-model="event_goal" />
    </div>
    <div class="margins-edit row">
      <p class="text-edit">Место проведения</p>
      <input placeholder="edit me" v-model="event_place" />
    </div>
    <div class="margins-edit row d-flex align-items-end">
      <div class="col ps-0 col">
        <p class="text-edit">Уровень</p>
        <select class="col form-select" v-model="level" >
          <option disabled value="">Please select one</option>
          <option>Вузовский</option>
        </select>
      </div>
      <div class="col ps-md-0">
        <p class="text-edit">Формат проведения</p>
        <select class="col form-select" v-model="eventformat">
          <option disabled value="">Please select one</option>
          <option>Очное</option>
        </select>
      </div>
      <div class="col">
        <p class="text-edit">Уточняющее направление</p>
        <select class="col pe-0 form-select" v-model="clarifying_direction">
          <option disabled value="">Please select one</option>
          <option>Физическое</option>
        </select>
      </div>
    </div>
    <div class="margins-edit row d-flex align-items-end">
      <div class="col ps-0">
        <p class="text-edit">Направление (рейтинг)</p>
        <select class="col form-select" v-model="direction">
          <option disabled value="">Please select one</option>
          <option>СД</option>
        </select>
      </div>
      <div class="col">
        <div class="row">
          <p class="text-edit">Размер команды</p>
        </div>
        <div class="row">
          <input placeholder="edit me" v-model="team_size" />
        </div>
      </div>
      <div class="col">
        <p class="text-edit">Характер мероприятия</p>
        <select class="col pe-0 form-select" v-model="character_event">
          <option disabled value="">Please select one</option>
          <option>Соревнование</option>
        </select>
      </div>
    </div>
    <div class="margins-edit row d-flex align-items-end">
      <div class="col ps-0">
        <p class="text-edit">Контроль</p>
        <v-select class="form-select" v-model="control"> </v-select>
      </div>
      <div class="col">
        <div class="row">
          <p class="text-edit">Плановое количество участников</p>
        </div>
        <div class="row">
          <input placeholder="edit me" v-model="count_people" />
        </div>
      </div>
      <div class="col">
        <p class="text-edit">Вид участия</p>
        <select class="col pe-0 form-select" v-model="type_participation">
          <option disabled value="">Please select one</option>
          <option>Активное</option>
        </select>
      </div>
    </div>
    <div class="margins-edit row d-flex align-items-end">
      <div class="col">
        <p class="text-edit">Телефон</p>
        <div class="row pe-3">
          <input placeholder="edit me" v-model="phone" maxlength="12" x />
        </div>
      </div>
      <div class="col">
        <div class="row">
          <p class="text-edit">Почта</p>
          <div class="row pe-0 ps-0 ms-0">
            <input placeholder="edit me" v-model="email" />
          </div>
        </div>
      </div>
      <div class="col pe-4">
        <p class="text-edit">Ссылка на соц. сети</p>
        <div class="row ps-3">
          <input placeholder="edit me" v-model="social_links" />
        </div>
      </div>
    </div>
    <div class="margins-edit row pb-3">
      <p class="text-edit">Теги</p>
      <input placeholder="edit me" v-model="tags" />
    </div>
    <div class="d-flex justify-content-end pb-3">
      <button
        type="button"
        class="button"
        @submit.prevent=""
        v-on:click="createEvent()"
      >
        Создать
      </button>
      {{ responseMsg }}
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { onBeforeMount, ref } from "vue";
import VueDatePicker from "@vuepic/vue-datepicker";

const title = ref();
const description = ref();
const dateStart = ref();
const dateEnd = ref();
const dateStartRegistration = ref();
const dateEndRegistration = ref();
const event_goal = ref();
const event_place = ref();
const level = ref();
const eventformat = ref();
const clarifying_direction = ref();
const character_event = ref();
const team_size = ref();
const direction = ref();
const control = ref();
const count_people = ref();
const type_participation = ref();
const email = ref();
const phone = ref();
const social_links = ref();
const tags = ref();

const foundLevels = ref();

onBeforeMount(async () => {
  await fetchEventLevel();
});

async function fetchEventLevel() {
  // я эту хуйню позже перепишу
  await axios
    .get("/api/general/dictionary?class_name=уровень+мероприятия")
    .then((respose) => {
      let levels = respose.data;
      let arrayData = [];
      for (let i = 0; i < levels.length; i++) {
        let level = levels[i];

        arrayData[i] = { name: levels.name, data: `${level.name}` };
      }
      foundLevels.value = arrayData;
    });
}

const responseMsg = ref();

async function createEvent() {
  responseMsg.value = "сохранено";

  //create team
  await axios
    .post("api/events", {
      status: false,
      title: title.value,
      description: description.value,
      dateStart: new Date(dateStart.value),
      dateEnd: new Date(dateEnd.value),
      dateStartRegistration: new Date(dateStartRegistration.value),
      dateEndRegistration: new Date(dateEndRegistration.value),
      plan: "ddd",
      event_goal: event_goal.value,
      event_place: event_place.value,
      level: level.value,
      format: eventformat.value,
      clarifying_direction: clarifying_direction.value,
      character_event: character_event.value,
      team_size: team_size.value,
      direction: direction.value,
      control: control.value,
      count_people: count_people.value,
      type_participation: type_participation.value,
      email: email.value,
      phone: phone.value,
      social_links: social_links.value,
      tags: tags.value,
      type: 4,
    })
    .catch((err) => {
      if (err.response) {
        responseMsg.value = err.response.data.message[0];
      }
    });
}
</script>

<style lang="scss" scoped>
.eventInfo {
  box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.1);

  width: 100%;
  height: auto;

  padding: 20px;
  justify-content: center;
  border-radius: 1rem;
  transition: all 0.5s;

  h1 {
    font-size: 1.8em;
    margin-top: 1rem;
    padding-top: 1em;

    margin-bottom: 1rem;
    margin-inline-start: 3.8em;
    margin-inline-end: 1.71rem;
  }
}

.button {
  background-color: #ff502f;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    background: var(--main-color-hover);
    transition: 0.3s;
  }
}

.text-edit {
  padding: 0em;
  margin-bottom: 0.3em;
}

.margins-edit {
  padding-top: 1em;
  margin-inline-start: 1em;
  margin-inline-end: 1em;
}
</style>
