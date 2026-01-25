using ApplicationCore.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace Infrastructure.GoDex.Services
{
    public class ImageStorageService : IImageStorageService
    {
        private readonly string _imageRootPath;

        public ImageStorageService(string imageRootPath)
        {
            _imageRootPath = imageRootPath;

            if (!Directory.Exists(_imageRootPath))
                Directory.CreateDirectory(_imageRootPath);
        }

        public async Task<string> SaveAndResizeImageAsync(IFormFile file, int? widthPx, int? heightPx)
        {
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            var fileName = $"{Guid.NewGuid():N}{extension}";
            var filePath = Path.Combine(_imageRootPath, fileName);

            using var imageStream = file.OpenReadStream();
            using var originalImage = System.Drawing.Image.FromStream(imageStream);

            int newWidth = widthPx ?? originalImage.Width;
            int newHeight = heightPx ?? originalImage.Height;

            using var bitmap = new System.Drawing.Bitmap(originalImage, newWidth, newHeight);
            bitmap.Save(filePath, originalImage.RawFormat);

            return filePath;
        }
    }
}
