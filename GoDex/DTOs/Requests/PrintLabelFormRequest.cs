using ApplicationCore.DTOs;
using GoDex.Attributes;
using System.ComponentModel.DataAnnotations;

namespace GoDex.DTOs.Requests
{
    public class PrintLabelFormRequest
    {
        [Required]
        public PrinterConnectionDto Connection { get; set; }

        [Required]
        public LabelSettingDto LabelSetting { get; set; }

        [Required]
        public LabelElementDto Element { get; set; }

        [AllowedExtensions(new[] { ".bmp", ".gif" })]
        public IFormFile? Image { get; set; }
    }
}
