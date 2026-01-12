using ApplicationCore.DTOs;
using GoDex.DTOs.Requests;

namespace GoDex.Helper
{
    public static class FormToDtoConverter
    {
        public static PrintLabelRequestDto ConvertToDto(PrintLabelFormRequest form, string folderPath)
        {
            if (form == null)
                throw new ArgumentNullException(nameof(form));

            
            var element = new LabelElementDto
            {
                ProductName = form.Element.ProductName,
                ManufacturedDate = form.Element.ManufacturedDate,
                Phone = form.Element.Phone,
                ImagePath = null
            };

            
            if (form.Image != null && form.Image.Length > 0)
            {
                if (!Directory.Exists(folderPath))
                    Directory.CreateDirectory(folderPath);

                var extension = Path.GetExtension(form.Image.FileName).ToLowerInvariant();
                var fileName = Guid.NewGuid() + extension;
                var filePath = Path.Combine(folderPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    form.Image.CopyTo(stream);
                }

                element.ImagePath = filePath;
            }


            return new PrintLabelRequestDto
            {
                Connection = form.Connection,
                LabelSetting = form.LabelSetting,
                Element = element
            };
        }

    }
}
