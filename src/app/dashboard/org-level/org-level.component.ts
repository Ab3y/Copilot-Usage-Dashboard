import { Component, OnInit } from '@angular/core';
import { OrganizationLevelService } from '../../services/organization-level.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-org-level',
  templateUrl: './org-level.component.html',
  styleUrls: ['./org-level.component.scss']
})
export class OrgLevelComponent implements OnInit {

  orgName: any = "Octodemo";
  data: any = [];
  public chart: any;
  public langChart: any;
  public langUserChart: any;
  public editorChart: any;
  public editorUserChart: any;
  xlabel: any = [];
  total_lines_suggested: any = [];
  total_lines_accepted: any = [];
  total_active_users: any = [];

  dateSelected: any = "";
  langTitle: any = "";
  editorTitle: any = "";
  pieChartTitle: any = "";

  constructor(private organizationLevelService: OrganizationLevelService) { }

  ngOnInit(): void {
    // create chart
    this.getData();
  }

  getData() {

    // get data from service
    this.organizationLevelService.getData().subscribe((data: any) => {
      // console.log(data);
      this.data = data;
      sessionStorage.setItem('orgData', JSON.stringify(data));
      this.createChart();
    });
  }

  createChart() {
    // extract the day field from the data
    this.data.forEach((element: any) => {
      this.xlabel.push(element.day);
      this.total_lines_suggested.push(element.total_lines_suggested);
      this.total_lines_accepted.push(element.total_lines_accepted);
      this.total_active_users.push(element.total_active_users);
    });

    this.chart = new Chart("org-summary-chart", {
      type: 'bar', //this denotes tha type of chart

      data: {// values on X-Axis
        labels: this.xlabel,
        datasets: [
          {
            label: "Lines Suggested",
            data: this.total_lines_suggested,
            backgroundColor: 'blue'
          },
          {
            label: "Lines Accepted",
            data: this.total_lines_accepted,
            backgroundColor: 'green'
          }
        ]
      },
      options: {
        aspectRatio: 2.5,
        scales: {
          x: {
            stacked: true
          },
          y: {
            stacked: true
          }
        },
        onClick: this.handleClick
      }

    });
  }

  handleClick = (evt: any): void => {
    var points = evt.chart.getElementsAtEventForMode(evt, 'nearest', {
      intersect: true
    }, true);
    if (points.length) {
      const firstPoint = points[0];
      const label = evt.chart.data.labels[firstPoint.index];
      this.dateSelected = "Selected Date:  " + label ;
      
      // find the data for the selected label
      var orgData = JSON.parse(sessionStorage.getItem('orgData') || '{}');
      var innerData: any = "";

      for (let element of orgData) {
        if (element.day == label) {
          innerData = element.breakdown;
          break;
        }
      }

      var xLangLabel: any = [];
      var lang_lines_suggested: any = [];
      var lang_lines_accepted: any = [];
      var lang_active_users: any = [];

      var xEditorLabel: any = [];
      var editor_lines_suggested: any = [];
      var editor_lines_accepted: any = [];
      var editor_active_users: any = [];

      innerData.forEach((element: any) => {
        if (xLangLabel.indexOf(element.language) == -1) {
          xLangLabel.push(element.language);
          lang_lines_suggested.push(element.lines_suggested);
          lang_lines_accepted.push(element.lines_accepted);
          lang_active_users.push(element.active_users);
        } else {
          lang_lines_suggested[xLangLabel.indexOf(element.language)] += element.lines_suggested;
          lang_lines_accepted[xLangLabel.indexOf(element.language)] += element.lines_accepted;
          lang_active_users[xLangLabel.indexOf(element.language)] += element.active_users;
        }
      });

      innerData.forEach((element: any) => {
        if (xEditorLabel.indexOf(element.editor) == -1) {
          xEditorLabel.push(element.editor);
          editor_lines_suggested.push(element.lines_suggested);
          editor_lines_accepted.push(element.lines_accepted);
          editor_active_users.push(element.active_users);
        } else {
          editor_lines_suggested[xEditorLabel.indexOf(element.editor)] += element.lines_suggested;
          editor_lines_accepted[xEditorLabel.indexOf(element.editor)] += element.lines_accepted;
          editor_active_users[xEditorLabel.indexOf(element.editor)] += element.active_users;
        }

      });

      // chart for language breakdown
      this.languageChart(xLangLabel, lang_lines_suggested, lang_lines_accepted);
    
     // chart for Active Users breakdown - language wise and editor wise
      this.langAndEditorUserChart(xLangLabel, lang_active_users, xEditorLabel, editor_active_users);

      // chart for editor breakdown
      this.editorDetChart(xEditorLabel, editor_lines_suggested, editor_lines_accepted);

    }

  }

  languageChart(xLangLabel: any,lang_lines_accepted:any ,lang_lines_suggested:any): void {

    this.langTitle=" Language: Number of Lines Suggested vs Accepted";
    if (this.langChart) { this.langChart.destroy(); }
    this.langChart = new Chart("lang-chart", {
      type: 'bar', //this denotes tha type of chart

      data: {// values on X-Axis
        labels: xLangLabel,
        datasets: [
          {
            label: "Lines Suggested",
            data: lang_lines_suggested,
            backgroundColor: 'blue'
          },
          {
            label: "Lines Accepted",
            data: lang_lines_accepted,
            backgroundColor: 'green'
          }
        ]
      },
      options: {
        aspectRatio: 2.5,
        scales: {
          x: {
            stacked: true
          },
          y: {
            stacked: true
          }
        }
      }

    });
  }

  editorDetChart(xEditorLabel: any,editor_lines_accepted:any ,editor_lines_suggested:any): void {

    this.editorTitle= "Editor: Number of Lines Suggested vs Accepted";
   // add stacked bar chart using xEditorLabel, total_lines_suggested and total_lines_accepted
   if (this.editorChart) { this.editorChart.destroy(); }
   this.editorChart = new Chart("editor-chart", {
     type: 'bar', //this denotes tha type of chart

     data: {// values on X-Axis
       labels: xEditorLabel,
       datasets: [
         {
           label: "Lines Suggested",
           data: editor_lines_accepted,
           backgroundColor: 'blue'
         },
         {
           label: "Lines Accepted",
           data: editor_lines_accepted,
           backgroundColor: 'green'
         }
       ]
     },
     options: {
       aspectRatio: 2.5,
       scales: {
         x: {
           stacked: true
         },
         y: {
           stacked: true
         }
       }
     }

   });
  }

  langAndEditorUserChart(xLangLabel: any,lang_active_users:any ,xEditorLabel: any,editor_active_users:any): void {
    
    this.pieChartTitle="Active Users: Language & Editor";
    // add a pie chart using xLangLabel and total_active_users
     if (this.langUserChart) { this.langUserChart.destroy(); }
     this.langUserChart = new Chart("lang-pie-chart", {
       type: 'pie', //this denotes tha type of chart

       data: {// values on X-Axis
         labels: xLangLabel,
         datasets: [
           {
             label: "Active Users",
             data: lang_active_users
           }
         ]
       },
       options: {
         aspectRatio: 2.5,
         scales: {
           x: {
             stacked: true
           },
           y: {
             stacked: true
           }
         }
       }

     });

     // add a pie chart using xEditorLabel and total_active_users
     if (this.editorUserChart) { this.editorUserChart.destroy(); }
     this.editorUserChart = new Chart("editor-pie-chart", {
       type: 'pie', //this denotes tha type of chart

       data: {// values on X-Axis
         labels: xEditorLabel,
         datasets: [
           {
             label: "Active Users",
             data: editor_active_users
           }
         ]
       },
       options: {
         aspectRatio: 2.5,
         scales: {
           x: {
             stacked: true
           },
           y: {
             stacked: true
           }
         }
       }

     });
    }

}