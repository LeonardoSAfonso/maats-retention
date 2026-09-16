import { IsEmail, IsString, MinLength } from "class-validator";

export class CreateSubscriberDTO {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;
}

export default CreateSubscriberDTO;
