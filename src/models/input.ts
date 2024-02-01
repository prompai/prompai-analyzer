import {
    Input
} from './input-base';
import {UiInput} from './ui-input';
import {FormDataInput} from "./form-input";
import {BinaryInput} from "./bytes-input";


interface JsonInput extends Input<'json'> {
    schema: any;
}


type InputTypes = JsonInput | FormDataInput | BinaryInput | UiInput;


export {
    FormDataInput,
    BinaryInput,
    InputTypes,
    UiInput,
    JsonInput
}