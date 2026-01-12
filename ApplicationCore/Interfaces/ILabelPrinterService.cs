using ApplicationCore.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationCore.Interfaces
{
    public interface ILabelPrinterService
    {
        Task ConnectAsync(PrinterConnectionDto connection);
        Task SetupLabelAsync(LabelSettingDto labelSetting);
        Task PrintLabelAsync(LabelElementDto element);
        Task DisconnectAsync();
    }
}
