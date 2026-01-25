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
        private readonly FormToDtoConverter _converter;

        public LabelPrinterController(ILabelPrinterService labelPrinterService, FormToDtoConverter converter)
        {
            _labelPrinterService = labelPrinterService;
            _converter = converter;
        }

        [HttpPost("print")]
        public async Task<IActionResult> PrintTextLabel([FromForm] PrintLabelFormRequest form)
        {
            try
            {
                var requestDto = await _converter.ConvertToDtoAsync(form);
                await _labelPrinterService.ConnectAsync(requestDto.Connection);
                await _labelPrinterService.SetupLabelAsync(requestDto.LabelSetting);
                await _labelPrinterService.PrintLabelAsync(requestDto.Elements);
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
