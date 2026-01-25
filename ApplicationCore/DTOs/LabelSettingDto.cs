using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationCore.DTOs
{
    public class LabelSettingDto
    {
        [Required]
        public int PaperType { get; set; }
        [Required]
        public int LabelH { get; set; }
        [Required]
        public int LabelGap { get; set; }
        [Required]
        public int LabelW { get; set; }
        [Required]
        public int LabelDark { get; set; }
        [Required]
        public int LabelSpeed { get; set; }
        [Required]
        public int LabelPageNo { get; set; }
        [Required]
        public int LabelCopyNo { get; set; }

    }
}
