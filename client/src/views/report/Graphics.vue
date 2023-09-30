<script setup  lang="ts">
import EPie from '@/components/charts/EPie.vue';
import type { TypeGraphic, TypeReport, TypeSeason } from './enums_report';
import EBar from '@/components/charts/EBar.vue';

const props = defineProps<{
    typeGraphics: {
        id: number;
        data: TypeGraphic;
        isVisibleChart: boolean;
        typeReport: TypeReport;
    }[],
    graphics: {
        topTeams: {
            labelsTopTeams: string[];
            dataTopTeams: number[];
        };
        dataEventsInnerOuter: {
            value: number;
            name: string;
        }[];
        eventsSeasons: {
            value: number;
            name: TypeSeason;
        }[];
    }
}>()

</script>

<template>
    <div class="chart-container">
        <!-- statistic -->

        <!-- Мероприятия -->
        <div v-if="typeGraphics[0].isVisibleChart" class="block-content">

            <div class="row d-flex justify-content-center text-center">
                <h4>Мероприятия</h4>
                <div class="row g-4">
                    <div class="col-12 chartBorder">
                        <h6>Статистика дат проведения мероприятий</h6>
                        <EPie :data="props.graphics.eventsSeasons" name="даты проведения мероприятий" />
                    </div>

                    <div class="col-12 chartBorder">
                        <h6>Количество внутренних/внешних мероприятий</h6>

                        <EPie :data="props.graphics.dataEventsInnerOuter" name="количество мероприятий" />

                    </div>
                </div>

            </div>
        </div>





        <!-- Коллективы -->
        <div v-if="typeGraphics[1].isVisibleChart" class="block-content">

            <div class="row d-flex justify-content-center text-center">
                <h4>Коллективы</h4>
                <div class="row mt-4 chartBorder">
                    <h6>Топ коллективов с наибольшим числом мероприятий</h6>

                    <div class="col">
                        <EBar :labels="props.graphics.topTeams.labelsTopTeams"
                            :data="props.graphics.topTeams.dataTopTeams" />
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<style  lang="scss" scoped>
// statistic-----------------------------------------------------------------------------

.chart-container {
    width: 100%;
    margin: auto;

    .block-content {
        padding: 80px;
    }
}

.chart {
    margin: 15px;
    display: flex;
    width: 100%;
}

.chartBorder {
    border: var(--main-border-card);
    border-radius: 5px;
    padding: 20px;

}



// copied from Statistic
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
        font-weight: 500;
    }
}
</style>