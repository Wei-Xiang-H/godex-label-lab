using ApplicationCore.DTOs;
using ApplicationCore.Interfaces;
using Infrastructure.SDK;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.GoDex.Services
{
    public class GodexTextLabelService : ILabelPrinterService
    {
        private readonly GodexPrinterClient _client;

        public GodexTextLabelService(GodexPrinterClient client)
        {
            _client = client;
        }

        public async Task ConnectAsync(PrinterConnectionDto connection)
        {
            _client.ConnectPrinter(connection);
        }

        public async Task SetupLabelAsync(LabelSettingDto labelSetting)
        {
            _client.LabelSetup(labelSetting);
        }

        public async Task PrintLabelAsync(LabelElementDto element)
        {
            _client.PrintStart();
            _client.PrintTextSelect(10, 10, 50, element.ProductName,0, (FontWeight)400, (RotateMode)0);
            _client.PrintTextSelect(10, 100, 50, element.ManufacturedDate.ToString("yyyy-MM-dd"), 0, (FontWeight)400, (RotateMode)0);
            _client.PrintTextSelect(10, 200, 50, element.Phone, 0, (FontWeight)400, (RotateMode)0);
            if (element.ImagePath != null)
            {
                _client.PrintImg(10, 300, element.ImagePath, 0);
            }

            _client.PrintEnd();
        }

        

        public async Task DisconnectAsync()
        {
            _client.DisconnectPrinter();
        }
    }
}
