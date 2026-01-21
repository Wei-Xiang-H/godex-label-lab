using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationCore.DTOs
{
    public  class LabelElementDto
    {
        public LabelElementType Type { get; set; }

        public int LabelX { get; set; }
        public int LabelY { get; set; }

        // Text
        public string? LabelText { get; set; }
        public int? FontHeight { get; set; }
        public int? TextWidth { get; set; }

        // Image
        public string? ImagePath { get; set; }
    }

    

    public enum LabelElementType
    {
        Text,
        Image
    }




}
