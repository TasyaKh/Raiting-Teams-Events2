
<!-- в БД в teams->direction->shortname должны быть
   (НИД, КТД, УД, СД, ОД) хардкод, а как по другому определить вид направления? -->

<script setup lang="ts" >
import { onBeforeMount, ref, watch } from 'vue';
import { DatePicker } from 'v-calendar';

import DownloadReport from './DowloadReport.vue';

// graphics
import ColorfulBlocks from '@/components/charts/ColorfulBlocks.vue';

import { useTeamStore } from '@/store/team_store';
import _, { defaultsDeep, forIn } from 'lodash';
import { useEventStore } from '@/store/events_store';
import { useDictionaryStore } from '@/store/dictionary_store';
import { DirectionId } from '@/store/enums/enum_event';
import { useChartStore } from './chart_logic';
import { useStatiscticLogicStore } from './statistic_logic';

import { TimeRange, TypeGraphic, TypeReport, TypeSeason } from './enums_report';
import { DirectionName } from '@/store/enums/enum_teams';
import { EVENT_LEVEL, EVENT_TYPE } from '@/store/constants/constants_class_names';
import Graphics from './Graphics.vue';


// store--------------------------------------------------------------
const teamStore = useTeamStore();
const eventStore = useEventStore();

const chartStore = useChartStore();
const statisticLogic = useStatiscticLogicStore();
const dictionaryStore = useDictionaryStore();
// store--------------------------------------------------------------


// dropdowns-----------------------------------------------------------
const levels = ref([{ id: 0, name: "Все" }])
const types = ref([{ id: 0, name: "Все" }])

const foundTeams = ref([{ name: "Все", id: 0 }])
const foundEvents = ref()
// dropdowns-----------------------------------------------------------


// graphics and checkboxes
const typeGraphics = ref([{ id: 0, data: TypeGraphic.EVENTS_STATISTIC, isVisibleChart: true, typeReport: TypeReport.DIRECTION },
{ id: 1, data: TypeGraphic.TEAMS_EVENTS, isVisibleChart: false, typeReport: TypeReport.TEAM },
{ id: 2, data: TypeGraphic.DEFAULT_PARAMETERS, isVisibleChart: true, typeReport: TypeReport.DIRECTION }])

// даты
const dates = [{ id: 0, date: '1н', timeRange: TimeRange.WEEK },
{ id: 1, date: '1м', timeRange: TimeRange.MONTH }, { id: 2, date: '1г', timeRange: TimeRange.YEAR }]

//типы отчетов
const typeReports = [{ id: 0, data: TypeReport.DIRECTION }, { id: 1, data: TypeReport.TEAM }]

// выбранные параметры
const selectedParams = ref({
  dateRange: { start: new Date(new Date().getTime() - 31556952000 * 5), end: new Date() }, //дата
  selectedDirection: 0,                     //все направления
  selectedLevel: levels.value[0],           //уровень
  selectedType: types.value[0],             //тип мероприятия
  selectedTypeReport: TypeReport.DIRECTION, //тип отчета
  selectedTeam: { name: "Все", id: 0 }      //выбранный коллектив
})


// data for graphics---------------------------------------------------

let graphics = ref({
  // оп коллективов
  topTeams: { labelsTopTeams: ['-'], dataTopTeams: [0] },
  //данные для графика внутренние/внешние мероприятия
  dataEventsInnerOuter: [
    { value: 0, name: "Внешнее" },
    { value: 0, name: "Внутреннее" },],
  // сезонность проведения мероприятий
  eventsSeasons: [
    { value: 0, name: TypeSeason.AUTUMN },
    { value: 0, name: TypeSeason.WINTER },
    { value: 0, name: TypeSeason.SPRING },
    { value: 0, name: TypeSeason.SUMMER },
  ]
})



const colorfulBlocksData = ref([
  { value: 0, name: "Число мероприятий" },
  { value: 0, name: "Число коллективов" },])
// data for graphics---------------------------------------------------

// найденные направления из системы
const foundDirections = ref([{ id: 0, shortname: "Все", idDB: 0, idDirectionEvent: DirectionId.ALL }])           //дата

// заполнить выпадающие списки
function fillDropdowns(data: any) {

  let res = [{ id: 0, name: "Все" }]

  for (let i = 0; i < data.length; i++) {
    res.push({ id: data[i].id, name: data[i].name })
  }

  return res
}

onBeforeMount(async () => {

  let lev = await dictionaryStore.getFromDictionaryByClassID(EVENT_LEVEL)
  levels.value = fillDropdowns(lev)

  let tp = await dictionaryStore.getFromDictionaryByClassID(EVENT_TYPE)
  types.value = fillDropdowns(tp)

  await getDirections()
  getEvents()
})

// если выбран коллектив то получить статистику с мероприятий
watch(() => selectedParams.value.selectedTeam, async () => {
  getEvents()
})

// date in calendar changed (для календаря)
watch(() => selectedParams.value.dateRange, () => {
  getEvents()
})


// получение мероприятий
async function getEvents() {

  switch (selectedParams.value.selectedTypeReport) {
    case TypeReport.DIRECTION:
      await getEventsByDirection()
      break
    case TypeReport.TEAM:
      await getEventsOfTeam(selectedParams.value.selectedTeam.id)
      break
  }

  updateCharts()

}

async function changeTimeViaButton(timeRange: TimeRange) {

  let dStart = new Date()
  let dEnd: Date = new Date()

  switch (timeRange) {
    case TimeRange.WEEK:
      dStart.setTime(dStart.getTime() - 604800000)//week in millis
      break;
    case TimeRange.MONTH:
      dStart.setTime(dStart.getTime() - 2629800000)//month in millis
      break;
    case TimeRange.YEAR:
      dStart.setFullYear(dStart.getFullYear() - 1)
      break;
    case TimeRange.RANGE:
      break;
  }

  selectedParams.value.dateRange.start = dStart
  selectedParams.value.dateRange.end = dEnd

  getEvents()
}

// получить мероприятия коллектива
async function getEventsOfTeam(teamId: number) {


  const eventsOfTeam = await getEventsViaJournalsByTeam(teamId)

  // console.log("eventsOfTeam.data")
  // console.log(eventsOfTeam.data)
  foundEvents.value = eventsOfTeam.data
  colorfulBlocksData.value[0].value = eventsOfTeam.count
}

// обновить гарфики
async function updateCharts() {

  typeGraphics.value.forEach(async (it) => {

    switch (it.data) {
      case TypeGraphic.EVENTS_STATISTIC:
        if (it.isVisibleChart) { //если график нужно отобразить
          graphics.value.dataEventsInnerOuter = chartStore.countEventsInnerOuter(foundEvents.value)
          graphics.value.eventsSeasons = chartStore.countEventsBySeason(foundEvents.value)
        }
        break;
      case TypeGraphic.TEAMS_EVENTS:
        // let teamsMax = 5

        if (it.isVisibleChart) {
          let res = await chartStore.countTeamsEvents(foundTeams.value,
            selectedParams.value.dateRange.start, selectedParams.value.dateRange.end,
            selectedParams.value.selectedLevel.id,
            selectedParams.value.selectedType.id)

          graphics.value.topTeams.labelsTopTeams = res.labelsTopTeams
          graphics.value.topTeams.dataTopTeams = res.dataTopTeams
        }
        break;
      case TypeGraphic.DEFAULT_PARAMETERS:

        break;
    }

  })
}


// получить идшники направлений с бд, чтобы по этим идшникам найти
// эти направления 
async function getDirections() {

  let data = await teamStore.fetchDirections()

  let directions = data[0]
  let arrayData = []
  arrayData[0] = { id: 0, shortname: DirectionName.ALL, idDB: 0, idDirectionEvent: DirectionId.ALL }

  for (let i = 0; i < directions.length; i++) {
    // console.log("directions " + directions[i].shortname)
    let direction = directions[i]

    let idDirectionEvent = statisticLogic.directionInTeamsConvertToDirectionInEvents(direction.shortname)
    arrayData[i + 1] = { id: i + 1, shortname: direction.shortname, idDB: direction.id, idDirectionEvent: idDirectionEvent };
  }

  foundDirections.value = arrayData
}


// проверить какие графики показать, а какие убрать
function seeGraphics(graphic: {
  id: number;
  data: TypeGraphic;
  isVisibleChart: boolean;
}) {

  typeGraphics.value[graphic.id].isVisibleChart = !graphic.isVisibleChart
}


// получить всех пользователей и выбрать из них нужных
async function getTeamsOfDirection(directionId: number) {

  let data = await teamStore.fetchTeamsOfDirection(directionId)

  // console.log("selectedDirection.value " + selectedDirection.value+ " " + data)
  let teams = data[0]
  colorfulBlocksData.value[1].value = data[1]
  let arrayData = []

  for (let i = 0; i < teams.length; i++) {
    let team = teams[i]
    arrayData[i] = { name: team.title, id: team.id };
  }

  if (teams.length > 0)
    selectedParams.value.selectedTeam = arrayData[0]
  else selectedParams.value.selectedTeam = { name: "Все", id: 0 }

  foundTeams.value = arrayData
}

//получит Events via journals-------------------------------------------------


async function getEventsViaJournalsByTeam(teamId: number) {

  let res = await eventStore.getEventsViaJournalsByTeam(teamId, selectedParams.value.dateRange.start,
    selectedParams.value.dateRange.end, selectedParams.value.selectedType.id, selectedParams.value.selectedLevel.id)
  let arrayData = res.data[0]
  let countAppropriate = res.data[1]

  return { data: arrayData, count: countAppropriate }
}



// получить мероприятия
async function getEventsByDirection() {

  let direction = DirectionId.ALL
  direction = foundDirections.value[selectedParams.value.selectedDirection].idDirectionEvent

  let data = await eventStore.getEventsByDirection(direction,
    selectedParams.value.dateRange.start, selectedParams.value.dateRange.end,
    selectedParams.value.selectedLevel.id,
    selectedParams.value.selectedType.id,)

  let events = data[0]
  colorfulBlocksData.value[0].value = data[1]

  foundEvents.value = events
}


async function changeDirection(direction: any) {

  selectedParams.value.selectedDirection = direction.id

  switch (selectedParams.value.selectedTypeReport) {
    case TypeReport.DIRECTION:
      getEvents()
      break
    case TypeReport.TEAM:
      await getTeamsOfDirection(direction.idDB)
      getEvents()
      break
  }

}


function changeTypeReport() {
  const tR = selectedParams.value.selectedTypeReport

  switch (tR) {

    case TypeReport.DIRECTION:
      selectedParams.value.selectedTeam = { name: "Все", id: 0 }
      typeGraphics.value[1].isVisibleChart = false
      break

    case TypeReport.TEAM:
      getTeamsOfDirection(foundDirections.value[selectedParams.value.selectedDirection].idDB)
      break
  }
}

</script>
         
         
         
<template>
  <div class="row">
    <div class="col-lg-5">
      <div class=" block-content">

        <div class="row text-center mb-2">
          <h6>{{ selectedParams.dateRange.start.toDateString() }} - {{ selectedParams.dateRange.end.toDateString() }}</h6>
        </div>

        <!-- time -->

        <div class="row">
          <div class="w-100 justify-content-center d-flex">
            <div class="date">
              <button class=" btn-custom-secondary date" v-for="dt in dates" @click="changeTimeViaButton(dt.timeRange)">{{
                dt.date
              }}</button>

              <div class="my-dropdown" style="float:center;">
                <button class="dropbtn btn-custom-secondary date"><font-awesome-icon icon="calendar-days" /></button>
                <div class="dropdown-content">
                  <DatePicker v-model="selectedParams.dateRange" is-range />
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- time -->




        <!-- выбрать направление -->
        <div class="row my-4 d-flex justify-content-md-center directions">

          <div v-for="direc in foundDirections" class="col-auto d-flex my-1">
            <div @click="changeDirection(direc)"
              :class="[{ active: selectedParams.selectedDirection == direc.id }, 'direction']">{{
                direc.shortname
              }}</div>
          </div>

        </div>
        <!-- выбрать направление -->




        <!-- dropdowns select property for event or team -->

        <!-- team statistic or directions statistic -->
        <div class="row my-4 d-flex ">

          <label class="form-label">тип отчетности</label>
          <div class="form-check col-auto mx-2" v-for="drT in typeReports">
            <input class="form-check-input" type="radio" name="flexRadioDefault"
              :checked="drT.data == selectedParams.selectedTypeReport" :value="drT.data"
              v-model="selectedParams.selectedTypeReport" @change="changeTypeReport()">
            <label class="form-check-label">
              {{ drT.data }}
            </label>
          </div>

        </div>

        <div class="row">


          <!-- team -->
          <div class="col-auto  d-flex my-1" v-if="selectedParams.selectedTypeReport == TypeReport.TEAM">
            <div class="mb-3">
              <label class="form-label">коллектив</label>
              <v-select placeholder="Название коллектива" label="name" :options="foundTeams"
                v-model="selectedParams.selectedTeam"></v-select>
            </div>
          </div>

          <!-- level -->
          <div class="col-auto  d-flex my-1">
            <div class="mb-3">
              <label class="form-label">уровень мероприятий</label>
              <select class="form-select" aria-label="Default select example" v-model="selectedParams.selectedLevel"
                @change="getEvents()">
                <option v-for="lvl in levels" :value="lvl">{{ lvl.name }}</option>
              </select>
            </div>
          </div>

          <!-- types -->
          <div class="col-auto  d-flex my-1">
            <div class="mb-3">

              <label class="form-label">тип мероприятий</label>
              <select class="form-select" aria-label="Default select example" v-model="selectedParams.selectedType"
                @change="getEvents()">
                <option v-for="tp in types" :value="tp">{{ tp.name }}</option>
              </select>
            </div>
          </div>

        </div>



        <!--Отчетность  -->
        <div class="my-4">
          <p>Отчетность</p>
          <hr>
        </div>

        <!-- скачать отчетность -->
        <DownloadReport :direction="foundDirections[selectedParams.selectedDirection]"
          :type-report="selectedParams.selectedTypeReport" :level="selectedParams.selectedLevel"
          :type-event="selectedParams.selectedType" :date-range="selectedParams.dateRange"
          :team="selectedParams.selectedTeam" />





        <div class="my-4">
          <p>Отобразить графики</p>
          <hr>
        </div>

        <!-- checkboxes -->
        <div class="row">

          <div v-for="g in 
                           typeGraphics">

            <div class="form-check"
              v-if="g.typeReport == selectedParams.selectedTypeReport || g.typeReport == TypeReport.DIRECTION"
              @change="seeGraphics(g)">
              <input class="form-check-input" type="checkbox" value="" id="flexCheckChecked" :checked="g.isVisibleChart">
              <label class="form-check-label" for="flexCheckChecked">
                {{ g.data }}
              </label>
            </div>

          </div>
        </div>

        <!--Общие показатели  -->
        <div v-if="typeGraphics[2].isVisibleChart" class="row mt-4">

          <ColorfulBlocks :data="colorfulBlocksData" />

        </div>
      </div>
    </div>





    <!-- Graphics -->
    <div class="col-lg-7">
      <Graphics :typeGraphics="typeGraphics" :graphics="graphics" />
    </div>
    <!-- Graphics -->


  </div>
</template>
         
         
         
<style lang="scss" scoped>
// dropdown for calendar----------------------------------------------------------------------
.dropbtn {
  padding: 16px;
  font-size: 16px;
  border: none;
  color: black;
  cursor: pointer;
}

.my-dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-content {
  display: none;
  position: absolute;
  right: 0px;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
  border-radius: 20px;
}


.dropdown-content a:hover {
  background-color: #f1f1f1;
}

.my-dropdown:hover .dropdown-content {
  display: block;
}

// otchet--------------------------------------------------------------------------------
.form-select {
  width: fit-content;
  padding: 5px;
  min-width: 150px;
}

// блоки с содержимым-------------------------------------------------------------------
.block-content {
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  border-radius: 5px;
  padding: 40px;
  margin: 30px auto 30px auto;
  background: white;

  .directions {
    .direction {
      padding: 5px 30px;
      border: 0.5px solid var(--second-color);
      border-radius: 20px;

      &:hover {
        color: white;
        background: var(--second-color);
        opacity: 0.5;
        transition: 0.3s;
      }

    }

    .active {
      background-color: var(--second-color);
      color: white;
    }


  }

  hr {
    height: 1.5px;
    border: 0;
    background: var(--second-color);
  }

  p {
    color: var(--second-color);
    font-weight: 800;
  }
}

.date {

  button.date {
    background: none;
    padding: 0.5rem 0.8rem;
    box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
    border-radius: 50px;
    margin: 8px;

    &:hover {
      box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
      background-color: var(--main-color);
      transition: 0.3s;
    }
  }

  .dropdown-content {
    button {
      background: white;
      color: black;
    }
  }
}

.btn-custom-secondary{
  color: black;
}

// чекбоксы--------------------------------------------------------------------------------
</style>
         
         
         
         
         