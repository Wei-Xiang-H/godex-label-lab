using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationCore.DTOs
{
    public class PrinterConnectionDto
    {

        [Required]
        [MinLength(1)]
        public string IpAddress { get; set; } 

        [Required]
        public int Port { get; set; } = 9100; 
    }
}
