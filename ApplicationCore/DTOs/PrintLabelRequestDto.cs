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
        public PrinterConnectionDto Connection { get; set; } 

        public LabelSettingDto LabelSetting { get; set; } 

        
        public List<LabelElementDto> Elements { get; set; }
    }
}
