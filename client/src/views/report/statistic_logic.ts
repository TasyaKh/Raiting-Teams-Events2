import { DirectionId } from "@/store/enums/enum_event"
import { DirectionName } from "@/store/enums/enum_teams"
import { defineStore } from "pinia"

export const useStatiscticLogicStore = defineStore("statisticLogic", () => {

   function directionInTeamsConvertToDirectionInEvents (direction: string){
    
        let directionInEvent = DirectionId.ALL
    
        switch (direction) {
            case DirectionName.KTD:
                directionInEvent =  DirectionId.KTD
                break
            case DirectionName.UD:
                directionInEvent =  DirectionId.UD
                break
            case DirectionName.SD:
                directionInEvent =  DirectionId.SD
                break
            case DirectionName.NID:
                directionInEvent =  DirectionId.NID
                break
            case DirectionName.OD:
                directionInEvent =  DirectionId.OD
                break
        }
    
        return directionInEvent
    
    }

    return {
        directionInTeamsConvertToDirectionInEvents
    }
})
