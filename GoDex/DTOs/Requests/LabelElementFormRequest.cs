using ApplicationCore.DTOs;
using GoDex.Attributes;
using System.ComponentModel.DataAnnotations;

namespace GoDex.DTOs.Requests
{
    public class LabelElementFormRequest
    {
        [Required]
        public LabelElementType Type { get; set; }

        [Required]
        public int LabelX { get; set; }

        [Required]
        public int LabelY { get; set; }

        public string? LabelText { get; set; }
        public int? FontHeight { get; set; }
        public int? TextWidth { get; set; }

        [AllowedExtensions(new[] { ".bmp", ".gif" })]
        public IFormFile? Image { get; set; }
        public int? ImageWidthPx { get; set; }
        public int? ImageHeightPx { get; set; }
    }

}
