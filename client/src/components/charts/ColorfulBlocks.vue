<script setup lang="ts">

const props = defineProps<{
    data: {
        value: number;
        name: string;
    }[]
}>()


</script>

<template>
    <!--Общие показатели  -->

    <div class="col" v-for="i in props.data.length">
        <div :class="['colored-block-' + i]" class="my-2">
            <div class="row title">{{ props.data[i-1].name }}</div>
            <div class="row value">{{  props.data[i-1].value  }}</div>
        </div>
    </div>
</template>

<style lang="scss" scoped>

// colored-block

.colored-block-1,
.colored-block-2,
.colored-block-3,
.colored-block-4 {

    border-radius: 10px;
    padding: 20px 80px;
    min-width: fit-content;
    min-height: 100px;
}

.colored-block-1 {
    background: #CEEAB2;
    background: linear-gradient(120deg, #CEEAB2 0%, #ABECEC 100%);
}

.colored-block-2 {
    background: #FFADAD;
    background: linear-gradient(120deg, #FFADAD 0%, #E7C756 100%);
}

.colored-block-3 {
    background: #A9ADFF;
    background: linear-gradient(120deg, #A9ADFF 0%, #5BDFDF 100%);
}

.colored-block-4 {
    background: #E5ADFF;
    background: linear-gradient(120deg, #E5ADFF 0%, #718CED 100%);
}
</style>