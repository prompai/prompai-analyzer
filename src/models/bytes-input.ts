import {Input} from "./input-base";



interface BinaryInput extends Input<'binary'> {
    accept: string[];
    minSize?: number;
    maxSize?: number;
}


export {
    BinaryInput
}

