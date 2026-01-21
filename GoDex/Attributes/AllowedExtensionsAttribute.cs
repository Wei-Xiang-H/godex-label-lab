using System.ComponentModel.DataAnnotations;

namespace GoDex.Attributes
{
    [AttributeUsage(AttributeTargets.Property)]
    public class AllowedExtensionsAttribute : ValidationAttribute
    {
        private readonly string[] _extensions;

        public AllowedExtensionsAttribute(string[] extensions)
        {
            _extensions = extensions;
        }

        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value == null)
                return ValidationResult.Success;

            if (value is IFormFile file)
            {
                return ValidateFile(file);
            }

            if (value is IEnumerable<IFormFile> files)
            {
                foreach (var f in files)
                {
                    var result = ValidateFile(f);
                    if (result != ValidationResult.Success)
                        return result;
                }

                return ValidationResult.Success;
            }

            return new ValidationResult("不支援的檔案型別");
        }

        private ValidationResult ValidateFile(IFormFile file)
        {
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!_extensions.Contains(extension))
            {
                return new ValidationResult(
                    $"不支援的檔案格式，僅允許：{string.Join(", ", _extensions)}");
            }

            return ValidationResult.Success;
        }
    }

}
