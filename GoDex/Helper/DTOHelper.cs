using ApplicationCore.DTOs;
using GoDex.DTOs.Requests;

namespace GoDex.Helper
{
    public  class FormToDtoConverter
    {
        public async Task<PrintLabelRequestDto> ConvertToDtoAsync(PrintLabelFormRequest form)
        {
            // 存圖片的資料夾（你可以自己改）
            var imageFolder = @"C:\GodexImages";

            if (!Directory.Exists(imageFolder))
            {
                Directory.CreateDirectory(imageFolder);
            }

            var elements = new List<LabelElementDto>();

            foreach (var item in form.Elements)
            {
                var elementDto = new LabelElementDto
                {
                    Type = item.Type,
                    LabelX = item.LabelX,
                    LabelY = item.LabelY,
                    LabelText = item.LabelText,
                    FontHeight = item.FontHeight,
                    TextWidth = item.TextWidth
                };

                
                if (item.Type == LabelElementType.Image && item.Image != null)
                {
                    var extension = Path.GetExtension(item.Image.FileName).ToLowerInvariant();
                    var fileName = $"{Guid.NewGuid()}{extension}";
                    var filePath = Path.Combine(imageFolder, fileName);

                    await using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await item.Image.CopyToAsync(stream);
                    }

                    elementDto.ImagePath = filePath;
                }

                elements.Add(elementDto);
            }

            return new PrintLabelRequestDto
            {
                Connection = form.Connection,
                LabelSetting = form.LabelSetting,
                Elements = elements
            };
        }


    }
}
