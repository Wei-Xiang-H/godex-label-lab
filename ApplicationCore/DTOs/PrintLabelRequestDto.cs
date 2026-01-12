using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationCore.DTOs
{
    public class PrintLabelRequestDto
    {
        [Required]
        public PrinterConnectionDto Connection { get; set; } 

        [Required]
        public LabelSettingDto LabelSetting { get; set; } 

        [Required]
        public LabelElementDto Element { get; set; } 
    }
}
