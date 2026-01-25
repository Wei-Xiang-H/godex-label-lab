using ApplicationCore.DTOs;
using ApplicationCore.Interfaces;
using GoDex.DTOs.Requests;

namespace GoDex.Helper
{
    public  class FormToDtoConverter
    {
        private readonly IImageStorageService _imageService;

        public FormToDtoConverter(IImageStorageService imageService)
        {
            _imageService = imageService;
        }

        public async Task<PrintLabelRequestDto> ConvertToDtoAsync(PrintLabelFormRequest form)
        {
            var elements = new List<LabelElementDto>();

            foreach (var item in form.Elements)
            {
                var elementDto = new LabelElementDto
                {
                    Type = item.Type,
                    LabelX = item.LabelX,
                    LabelY = item.LabelY
                };

                if (item.Type == LabelElementType.Text)
                {
                    elementDto.LabelText = item.LabelText;
                    elementDto.FontHeight = item.FontHeight;
                    elementDto.TextWidth = item.TextWidth;
                }
                else if (item.Type == LabelElementType.Image && item.Image != null)
                {
                    elementDto.ImagePath = await _imageService.SaveAndResizeImageAsync(
                        item.Image, item.ImageWidthPx, item.ImageHeightPx);
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
