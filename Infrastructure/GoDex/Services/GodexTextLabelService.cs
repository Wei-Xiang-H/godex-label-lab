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

        public async Task PrintLabelAsync(List<LabelElementDto> elements)
        {
            _client.PrintStart();
            foreach (var element in elements)
            {
                switch (element.Type)
                {
                    case LabelElementType.Text:
                        _client.PrintTextSelect(
                            element.LabelX, 
                            element.LabelY, 
                            element.FontHeight.Value, 
                            element.LabelText, 
                            element.TextWidth.Value, 
                            (FontWeight)400, 
                            (RotateMode)0
                        ); 
                        break;
                    case LabelElementType.Image:
                        _client.PrintImg(element.LabelX,element.LabelY,element.ImagePath,0);
                        break;
                    default:
                        throw new NotSupportedException($"未知的 LabelElementType: {element.Type}");
                }
                ;
            }
            _client.PrintEnd();
        }

        

        public async Task DisconnectAsync()
        {
            _client.DisconnectPrinter();
        }
    }
}
