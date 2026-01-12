using ApplicationCore.DTOs;
using ApplicationCore.Interfaces;
using GoDex.DTOs.Requests;
using GoDex.Helper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GoDex.Controllers
{
    [ApiController]
    [Route("api/labels")]
    public class LabelPrinterController : ControllerBase
    {
        private readonly ILabelPrinterService _labelPrinterService;

        public LabelPrinterController(ILabelPrinterService labelPrinterService)
        {
            _labelPrinterService = labelPrinterService;
        }

        [HttpPost("print")]
        public async Task<IActionResult> PrintTextLabel([FromForm] PrintLabelFormRequest form)
        {
            try
            {
                var requestDto = FormToDtoConverter.ConvertToDto(form, "C:\\PrintImages");

                await _labelPrinterService.ConnectAsync(requestDto.Connection);
                await _labelPrinterService.SetupLabelAsync(requestDto.LabelSetting);
                await _labelPrinterService.PrintLabelAsync(requestDto.Element);
                await _labelPrinterService.DisconnectAsync();
                return Ok(new { message = "列印完成" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            
        }
    }
}
