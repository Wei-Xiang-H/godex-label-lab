using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace ApplicationCore.Interfaces
{
    public interface IImageStorageService
    {
        Task<string> SaveAndResizeImageAsync(IFormFile file, int? widthPx, int? heightPx);
    }
}
