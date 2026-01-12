using System.ComponentModel.DataAnnotations;

namespace GoDex.Attributes
{
    [AttributeUsage(AttributeTargets.Property)]
    public class AllowedExtensionsAttribute : ValidationAttribute
    {
        private readonly string[] _extensions;

        
        public AllowedExtensionsAttribute(string[] extensions)
        {
            _extensions = extensions.Select(e => e.ToLowerInvariant()).ToArray();
        }

        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            var file = value as IFormFile;

            
            if (file == null)
                return ValidationResult.Success;

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!_extensions.Contains(extension))
            {
                var allowedList = string.Join(", ", _extensions);
                return new ValidationResult($"只允許上傳以下格式的圖片：{allowedList}");
            }

            return ValidationResult.Success;
        }
    }
}
