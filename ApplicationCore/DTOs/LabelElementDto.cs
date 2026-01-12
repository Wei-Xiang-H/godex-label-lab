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
        [Required]
        [MinLength(1, ErrorMessage = "欄位不能為空")]
        public string ProductName { get; set; }

        [Required]
        public DateOnly ManufacturedDate { get; set; }

        [Required]
        public string Phone { get; set; }

        public string ImagePath { get; set; } = string.Empty;
    }

    


}
