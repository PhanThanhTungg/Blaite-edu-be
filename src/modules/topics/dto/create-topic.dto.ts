import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";


export class CreateTopicDto {
  @IsNotEmpty({ message: "Name is required" })
  @IsString({ message: "Name must be a string" })
  @ApiProperty({
    description: "Name of the topic",
    example: "Tiếng anh",
  })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "Description of the topic",
    example: "Học tiếng anh cơ bản",
  })
  description: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "Prompt for the topic",
    example: "Tôi học tới lớp 12, điểm tiếng Anh trung bình. Giờ muốn học lại để giao tiếp cơ bản với người nước ngoài, đặc biệt là nghe và nói. Mỗi ngày tôi có thể học 20 phút. Tôi thích học qua chat và quiz, không thích lý thuyết nhiều. Mong chatbot đóng vai người nói chuyện với tôi để tôi thực hành phản xạ.",
  })
  prompt: string;
}