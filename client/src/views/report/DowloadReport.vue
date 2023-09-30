<script setup  lang="ts">
import type { DirectionId } from '@/store/enums/enum_event';
import type { TypeReport } from './enums_report';
import { ref } from 'vue';
import { useEventStore } from '@/store/events_store';

const eventStore = useEventStore();

const props = defineProps<{
  direction: {
    id: number;
    shortname: string;
    idDB: number;
    idDirectionEvent: DirectionId;
  },
  typeReport: TypeReport,
  level: {
    id: number;
    name: string;
  },
  typeEvent: {
    id: number;
    name: string;
  },
  dateRange: { start: Date, end: Date },
  team: { name: string, id: number }
}>()

const resFile = ref() // файл
const fileURL = ref() //путь к файлу для загрузки

const loading = ref(false) //файл формируется

// получить отчет по направлению
async function getReportEventsOfDirection() {
  setLoading(true)
  let res = await eventStore.getReportEventsOfDirection(props.direction.idDirectionEvent, props.dateRange.start,
    props.dateRange.end, props.level.id, props.typeEvent.id)
  resFile.value = res.data
  setLoading(false)
}

// в процессе загрузки
function setLoading(load: boolean) {
  loading.value = load
}

// получить очтет по коллективу
async function getReportEventsOfTeam() {
  setLoading(true)

  let res = await eventStore.getReportEventsOfTeam(props.team.id, props.dateRange.start,
    props.dateRange.end, props.typeEvent.id, props.level.id)
  resFile.value = res.data
  loading.value = true
  setLoading(false)

}

// сформировать соостветствующий очтет
async function getReport() {

  if (props.team != null && props.team.id > 0) {
    await getReportEventsOfTeam()
  } else {
    await getReportEventsOfDirection()
  }
}

// скачать файл
async function downloadFile() {
  const file = new Blob([resFile.value], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  fileURL.value = URL.createObjectURL(file);
}

</script>


<template lang="">

    <div class="accordion" id="accordionExample">
      <div class="accordion-item">

        <h2 class="accordion-header" id="headingOne">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne"
            aria-expanded="true" aria-controls="collapseOne">
            Итоговая отчетность
          </button>
        </h2>

        <div id="collapseOne" class="accordion-collapse collapse" aria-labelledby="headingOne"
          data-bs-parent="#accordionExample">
          <div class="accordion-body m-4">

            <div v-if="team.id>0" class="row mb-3">
              <div class="col text-bg-light"> {{team.name}}</div>
            </div>

            <div class="row">
              <div class="col fw-bold"> направление: </div>
              <div class="col">{{direction.shortname}}</div>
            </div>

            <div class="row my-3 ">
              <div class="col fw-bold"> вид отчета: </div>
              <div class="col"> {{ typeReport }}</div>
            </div>

            <div class="row  my-3">
              <div class="col fw-bold"> уровень мероприятия: </div>
              <div class="col">{{ level.name  }}</div>
            </div>

            <div class="row  my-3">
              <div class="col fw-bold"> тип мероприятия: </div>
              <div class="col"> {{ typeEvent.name }}</div>
            </div>

            <div class="row  my-3">
              <div class="col fw-bold"> дата:</div>
              <div class="col"> {{ dateRange.start.toLocaleDateString() }} - {{ dateRange.end.toLocaleDateString() }}</div>
            </div>

            <div class="row g-2 mt-4 mx-3 d-flex  justify-content-end ">
              <div class="col d-flex justify-content-end align-items-center">
                
               <a v-if="!loading && resFile" :href="fileURL" download="reportEvents.xlsx">
               <button @click="downloadFile()"> <font-awesome-icon icon="file-download" /></button>
               </a>
               <font-awesome-icon v-if="loading" icon="circle-notch" class="fas fa-spin fa-xl loading" />
   
               
              </div>
              <div class="col-auto d-flex justify-content-end">
                <button type="button"  @click="getReport()">
                Сформировать
              </button>
              </div>
             
            </div>


          </div>
        </div>
      </div>

    </div>
</template>

<style lang="scss" scoped></style>