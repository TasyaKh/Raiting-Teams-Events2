import { Status } from "../enums/enum_event"

export class Event {

    type?: number
    status?: Status = Status.ACCEPTED
    direction?: any
    user_id?: number
    search_text?:string
   
    limit = 5
    offset = 0
    // addition
    levels?:number[]
    types?:number[]
}