using ApplicationCore.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using static System.Net.Mime.MediaTypeNames;

namespace Infrastructure.SDK
{
    public class GodexPrinterClient
    {
        private readonly GodexPrinter _printer;
        public GodexPrinterClient()
        {
            _printer = new GodexPrinter();
        }

        public void ConnectPrinter(PrinterConnectionDto connection)
        {
            _printer.Open(connection.IpAddress, (int)connection.Port);
        }

        public void DisconnectPrinter()
        {
            _printer.Close();
        }


        public void LabelSetup(LabelSettingDto labelSetting)
        {
            _printer.Config.LabelMode((PaperMode)labelSetting.PaperType, (int)labelSetting.LabelH, (int)labelSetting.LabelGap);
            _printer.Config.LabelWidth((int)labelSetting.LabelW);
            _printer.Config.Dark((int)labelSetting.LabelDark);
            _printer.Config.Speed((int)labelSetting.LabelSpeed);
            _printer.Config.PageNo((int)labelSetting.LabelPageNo);
            _printer.Config.CopyNo((int)labelSetting.LabelCopyNo);
        }
        
        public void PrintStart()
        {
            _printer.Command.Start();
        }

        public void PrintEnd()
        {
            _printer.Command.End();
        }
        /// <summary>
        /// ASCII檢查
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        private bool ContainsNonAscii(string data)
        {
            return data.Any(c => c > 127);
        }
        /// <summary>
        /// 字型調整
        /// </summary>
        /// <param name="text"></param>
        /// <returns></returns>
        private string SelectFont(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return "Arial"; 

            foreach (char c in text)
            {
                if (c >= 0x3040 && c <= 0x30FF)  
                    return "MS Gothic";
                else if (c >= 0xAC00 && c <= 0xD7AF)  
                    return "GulimChe";
            }

            return "Arial"; 
        }

        public void PrintTextSelect(int posX, int posY, int fontHeight, string data, int textWidth, FontWeight dark, RotateMode rotate)
        {
            if (ContainsNonAscii(data))
            {
                _printer.Command.PrintText_Unicode(posX, posY, fontHeight, SelectFont(data), data, textWidth, dark, rotate);
            }
            else
            {
                _printer.Command.PrintText(posX, posY, fontHeight, SelectFont(data), data, textWidth, dark, rotate);
            }
        }

        public void PrintImg(int PosX, int PosY, string FileName, int mRotation)
        {
            _printer.Command.PrintImage(PosX, PosY, FileName, mRotation);
        }
    }
}
