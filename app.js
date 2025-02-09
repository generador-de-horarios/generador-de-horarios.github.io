useGoogle = false
Vue.component('modal', {
  template: '#modal',
  props: {
    open: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    classComputed(){
      if(this.open){
        return 'modal__open'
      }
      return ''
    }
  },
  watch: {
    open(val){
      this.fixBody(val)
    }
  },
  methods:{
    fixBody(val){
      if(val){
        document.body.style.overflow = 'hidden'
      }else{
        document.body.style.overflow = 'auto'
      }
    },
    close(e){
      if(e.target == this.$refs.overley)
        this.$emit('close')
    }
  },
  mounted(){
    this.fixBody(this.open)
  }
})

Vue.component('v-iframe', {
  template: '#iframe',
  props: {
    src: {
      type: String,
      required: true
    }
  },
  data(){
    return {
      srcAsync: ''
    }
  },
  mounted(){
    setTimeout(e=>{
      this.srcAsync = this.src
    }, 5000)
  }
})

Vue.component('color-piker', {
  template: '#color-piker',
  props:{
    value: {
      type: String
    },
    colors: {
      type: Array,
      default: ()=>{
        return [
          'var(--a)',
          'var(--b)',
          'var(--c)',
          'var(--d)',
          'var(--e)',
          'var(--f)',
          'var(--g)',
          'var(--h)',
          'var(--i)',
          'var(--j)',
          'var(--k)',
          'var(--l)',
          'var(--m)',
          'var(--n)',
          'var(--o)',
          'var(--p)',
          'var(--q)',
          'var(--r)',
          'var(--s)',
          'var(--t)',
          'var(--u)',
          'var(--v)',
          'var(--w)',
          'var(--x)',
        ]
      }
    }
  },
  methods: {
    setColor(color){
      // this.value = color
      this.$emit('input', color)
    }
  }
})

const app = new Vue({
  el: '#app',
  data(){
    return {
      name: '',
      days: {
        l: false,
        k: false,
        m: false,
        j: false,
        v: false,
        s: false,
        d: false
      },
      color: 'var(--primary)',
      init: -1,
      end: -1,
      courses: [],
      config: {
        firstHour: 7,
        lastHour: 22,
        block: false
      },
      modals:{
        error: false,
        colab: false,
        help: false,
        newSchedule: false,
        dev: false,
        terms: false,
        law: false,
        link: false,
        gifts: false
      },
      hideCommand: '',
      style: false,
      lol: false,
      showGrid: false,
      errorsToShow: [],
      randomColors: [],
      initApp: 0,
      saved: false,
      updateLocalStorage: true,
      yul: false,
      libs: [
        {
          name: 'Vue JS',
          desc: 'Vue es un framework progresivo para la construcción de interfaz de usuario.',
          link: 'https://vuejs.org/',
          image: ''
        },
        {
          name: 'Font Awesome',
          desc: 'Font Awesome ofrece íconos vectoriales escalables.',
          link: 'https://fontawesome.com/v4.7.0/',
          image: ''
        },
        {
          name: 'jsPDF',
          desc: 'Solución de cliente HTML5 para generar archivos PDF.',
          link: 'https://parall.ax/products/jspdf',
          image: ''
        },
        {
          name: 'SheetJS',
          desc: 'Librería para generación de hojas de cálculo con JavaScript.',
          link: 'https://sheetjs.org/',
          image: ''
        },
        {
          name: 'html2canvas',
          desc: 'Librería para conversión de html en un elemento canvas.',
          link: 'https://html2canvas.hertzen.com/',
          image: ''
        }
      ],
      link: '',
      newLink: '',
      dark: false,
      colorEditor: false,
      errorModalImg: '',
      errorImages: [
        '1.gif',
        '2.gif',
        '3.gif',
        '1.webp',
        '2.webp',
        '3.webp',
        '4.webp',
        '6.webp',
        '5.webp'
      ]
    }
  },
  methods: {
    add(){
      if(useGoogle)
        ga('send', 'event', 'curso', 'agregar', 'tiempo', Math.floor(Date.now() / 1000) - this.initApp)
      this.saved = false
      let errors = []
      let d = this.days
      let totalHours = this.config.lastHour - this.config.firstHour

      if(this.name.trim() == ''){
        errors.push('Debe asignar un nombre al curso')
      }

      if(!(d.l || d.k || d.m || d.j || d.v || d.s || d.d)){
        errors.push('Debe seleccionar al menos un día')
      }

      if(this.init < 0 || this.init > totalHours){
        errors.push('Debe seleccionar una hora de inicio')
      }

      if(this.end < 0 || this.end > totalHours){
        errors.push('Debe seleccionar una hora de finalización')
      }

      let course
      let update = false
      let times = []

      for (var c of this.courses) {
        if (c.name == this.name.trim()) {
          update = true
          course = c
        }
      }

      if(course == null){
        course = {
          name: this.name.trim(),
          times: [],
          color: this.color
        }
      }

      for (let day in this.days) {
        if(this.days[day]){
          times.push({
            init: this.rowToHour(this.init, '00'),
            end: this.rowToHour(this.end, '50'),
            day: day
          })
        }
      }

      if(errors.length == 0 ){
        let conflicts = this.colision(times)

        if(conflicts.state){
          console.log(conflicts)
          let text
          for (c of conflicts.with) {
            text = 'El horario escogido interfiere con el de ' + c.name + ' el ' + this.letterDayToName(c.time.day) + ', en el horario de las ' + c.time.init + ' a las ' + c.time.end
            errors.push(text)
          }
        }
      }

      if(errors.length == 0){
        course.times = course.times.concat(times)
        if(!update){
          this.courses.push(course)
        }
        this.clear()
      }else{
        this.showError(errors)
      }

      if(update){
        this.compressHours(course)
      }

    },
    showError(errors){
      this.errorsToShow = errors
      this.modals.error = true
      this.errorModalImg = this.errorImages[Math.floor(Math.random() * (this.errorImages.length - 1))]
    },
    clear(){
      this.name = ''
      this.init = -1
      this.end = -1

      for (let day in this.days) {
        if(this.days[day]){
          this.days[day] = false
        }
      }
    },
    letterDayToCol(letter){
      let i = 0
      for (let day in this.days) {
        if(letter == day){
          return i
        }
        i++
      }
      return -1
    },
    hourToRow(hour){
      let h = parseInt(hour.split(':')[0])
      return h - this.config.firstHour
    },
    rowToHour(row, end){
      return this.n(row + this.config.firstHour) + ':' + end
    },
    n(num){
      if(num<10){
        return '0'+num
      }
      return num
    },
    colision(times){
      let conflicts = []
      for(let c of this.courses){
        for(let t of c.times){
          for(let time of times){
            if(t.day === time.day){
              if(!(time.init<t.init && time.init<t.end && time.end<=t.init && time.end<t.end || time.init>t.init && time.init>=t.end && time.end>t.init && time.end>t.end)){
                conflicts.push({
                  name: c.name,
                  time: t,
                  obj: c
                })
              }
            }
          }
        }
      }
      return {
        state: conflicts.length > 0,
        with: conflicts
      }
    },
    letterDayToName(letter){
      let map = {
        l: 'lunes',
        k: 'martes',
        m: 'miércoles',
        j: 'jueves',
        v: 'viernes',
        s: 'sábado',
        d: 'domingo'
      }
      return map[letter]
    },
    removeTime(row, day, course){
      if(day.trim() != '' && course != null){
        let initHour = this.rowToHour(row, '00')
        let endHour = this.rowToHour(row, '50')
        let times = course.times.filter(e => {
          return e.day == day
        })
        for (time of times) {
          if(time.init == initHour && time.end == endHour){
            this.removeElementToArray(course.times, time)
          }else if(time.init == initHour){
            time.init = this.rowToHour(row + 1, '00')
          }else if(time.end == endHour){
            time.end = this.rowToHour(row - 1, '50')
          }else if(time.init < initHour && time.end > endHour){
            let newTime = {
              day: day,
              init: this.rowToHour(row + 1, '00'),
              end: time.end
            }
            time.end = this.rowToHour(row - 1, '50')
            course.times.push(newTime)
          }
        }

        if(course.times.length == 0){
          this.removeElementToArray(this.courses, course)
        }
      }

    },
    removeElementToArray(array, element){
      let index = array.indexOf(element)
      if (index > -1) {
        array.splice(index, 1)
      }
    },
    compressHours(course){
      for (var time of course.times) {
        for (var time2 of course.times) {
          if (time != time2 && time.day == time2.day) {
            let t1i = this.hourToRow(time.init)
            let t1e = this.hourToRow(time.end)
            let t2i = this.hourToRow(time2.init)
            let t2e = this.hourToRow(time2.end)

            if(t1e + 1 == t2i || t2e + 1 == t1i){
              if(t1i < t2i){
                time.end = time2.end
                this.removeElementToArray(course.times, time2)
              }else{
                time2.end = time.end
                this.removeElementToArray(course.times, time)
              }
            }else if(t1i < t2i && t1e > t2e){
              this.removeElementToArray(course.times, time2)
            }
          }
        }
      }
    },
    executeHideCommand(){
      let text = this.hideCommand.toLowerCase()
      this.$refs.hideCommand.blur()
      switch (text) {
        case 'color lol':
          this.lol = true
          if(useGoogle)
            ga('send', 'event', 'comando_secreto', 'color_lol', 'tiempo', Math.floor(Date.now() / 1000) - this.initApp)
          break;
        case 'style':
          this.style = true
          if(useGoogle)
            ga('send', 'event', 'comando_secreto', 'style', 'tiempo', Math.floor(Date.now() / 1000) - this.initApp)
          break;
        case 'grid':
          this.showGrid = !this.showGrid
          if(useGoogle)
            ga('send', 'event', 'comando_secreto', 'grid', 'tiempo', Math.floor(Date.now() / 1000) - this.initApp)
          break;
        case 'pdf':
          this.downloadPDF()
          if(useGoogle)
            ga('send', 'event', 'comando_secreto', 'pdf', 'tiempo', Math.floor(Date.now() / 1000) - this.initApp)
          break;
        case 'fb.com/yuliavilaart':
        case 'facebook.com/yuliavilaart':
          this.yul = !this.yul
          if(useGoogle)
            ga('send', 'event', 'comando_secreto', 'special_save', 'tiempo', Math.floor(Date.now() / 1000) - this.initApp)
          break;
        case 'special-save allow':
          this.yul = true
          if(useGoogle)
            ga('send', 'event', 'comando_secreto', 'special_save', 'tiempo', Math.floor(Date.now() / 1000) - this.initApp)
          break;
        case 'special-save disallow':
          this.yul = false
          break;
        case 'dark':
          this.dark = !this.dark
          if(useGoogle)
            ga('send', 'event', 'comando_secreto', 'dark', 'tiempo', Math.floor(Date.now() / 1000) - this.initApp)
          break;
        case 'colored':
          this.colorEditor = !this.colorEditor
          if(useGoogle)
            ga('send', 'event', 'comando_secreto', 'colorEditor', 'tiempo', Math.floor(Date.now() / 1000) - this.initApp)
          break;
        default:

      }
    },
    creatSpreadsheet(type, name) {
      let el = this.$refs.table
      let wb = XLSX.utils.table_to_book(el, {sheet:"Sheet JS", raw:true})
      this.saved = true
      if(useGoogle)
        ga('send', 'event', 'guardar_como', 'hoja_' + type, 'tiempo', Math.floor(Date.now() / 1000) - this.initApp)
      return XLSX.writeFile(wb, name , {cellStyles:true})
    },
    createCanvas(){
      app.$refs.table.classList.add('table__toImage')
      let prom = html2canvas(app.$refs.table).then(canvas => {
          // this.$refs.canvasImage = canvas
          this.$refs.canvasContainer.appendChild(canvas)
          app.$refs.table.classList.remove('table__toImage')
          // this.convertCanvasToImage()
      })
      return prom
    },
    convertCanvasToImageAndDownload(){
      let link = this.$refs.canvasAction
      link.setAttribute('download', 'Horario.png')
      link.setAttribute('href', this.getCanvasAtImage())
      link.click()
      this.saved = true
      if(useGoogle)
        ga('send', 'event', 'guardar_como', 'imagen', 'tiempo', Math.floor(Date.now() / 1000) - this.initApp)
    },
    getCanvasAtImage(){
      return this.$refs.canvasContainer.lastChild.toDataURL("image/png").replace("image/png", "image/octet-stream")
    },
    downloadImage(){
      let prom = this.createCanvas()
      prom.then(()=>{
        this.convertCanvasToImageAndDownload()
      })
    },
    randomColor(){
      let letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    },
    generateRandomColors(){
      let temp = []
      for (let i = 0; i <= this.config.lastHour - this.config.firstHour + 1; i++) {
        temp[i] = []
        for (let j = 0; j < 7; j++) {
          temp[i][j] = this.randomColor()
        }
      }
      this.randomColors = temp
      if(this.style || this.lol){
        let self = this
        setTimeout(()=>{
          if(self.style || self.lol){
            this.generateRandomColors()
            document.body.style.setProperty('--primary', this.randomColor())
            document.body.style.setProperty('--secondary', this.randomColor())
            document.body.style.setProperty('--grey', this.randomColor())
            document.body.style.setProperty('--ligth-grey', this.randomColor())
          }
        }, 600)
      }
    },
    downloadPDF(){
      let prom = this.createCanvas()
      prom.then(()=>{
        let pdf = new jsPDF('l', 'pt', 'letter')
        let width = pdf.internal.pageSize.getWidth()
        // let height = pdf.internal.pageSize.getHeight()
        let ratio = this.$refs.canvasContainer.firstChild.height / this.$refs.canvasContainer.firstChild.width

        let height = ratio * width

        pdf.addImage(this.getCanvasAtImage(), 'PNG', 15, 15, width-30, height+15)
        pdf.save('Horario.pdf')
        app.saved = true
        if(useGoogle)
          ga('send', 'event', 'guardar_como', 'pdf', 'tiempo', Math.floor(Date.now() / 1000) - this.initApp)
      })
    },
    print(){
      this.saved = true
      print()
      if(useGoogle)
        ga('send', 'event', 'guardar_como', 'imprimir', 'tiempo', Math.floor(Date.now() / 1000) - this.initApp)
    },
    createNewSchedule(force){
      if(force || this.saved){
        this.courses = []
        this.saved = false
        location.hash = ''
        this.modals.newSchedule = false
      }else if(this.courses.length > 0){
        this.modals.newSchedule = true
      }
      if(useGoogle)
        ga('send', 'event', 'horario', 'crear_nuevo', 'tiempo', Math.floor(Date.now() / 1000) - this.initApp)
    },
    saveAsLink(){
      console.log('Lo siento amig@ no tengo dinero para pagar la DB :(')
      this.showError([
        'Lo siento amig@ no tengo dinero para pagar la DB :( \n Sigue así hacker!'
      ])
      if(false && this.courses.length > 0){
        if(useGoogle)
          ga('send', 'event', 'guardar_como', 'link', 'tiempo', Math.floor(Date.now() / 1000) - this.initApp)
        this.newLink = ''
        this.modals.link = true
        let self = this
        let data = {
          action: 6,
          arrayData: JSON.stringify(this.courses),
          pass: 0
        }

        let formData = new FormData()

        for (let n in data) {
          formData.append(n, data[n])
        }

        fetch("https://horarios.coldideas.com/php/url.php",
        {
            body: formData,
            method: "post"
        }).then(res => {return res.json()})
        .catch(error => console.error('Error:', error))
        .then(response => {
          location.hash = response.url
          self.newLink = 'https://horarios.coldideas.com#' + response.url
        })
      }else{
        // this.showError([
        //   'Debe agregar al menos un curso para poder crear un link'
        // ])
      }
    },
    loadShedule(link){
      if(useGoogle)
        ga('send', 'event', 'horario', 'cargar', 'tiempo', Math.floor(Date.now() / 1000) - this.initApp)
      let self = this
      let data = {
        action: 7,
        id: link
      }

      let formData = new FormData()

      for (let n in data) {
        formData.append(n, data[n])
      }

      fetch("https://horarios.coldideas.com/php/url.php",
      {
          body: formData,
          method: "post"
      })
      .catch(error => self.showError([
        'El horario no ha podido ser cargado.'
      ]))
      .then(res => {return res.json()})
      .then(response => {
        if(!response){
          self.showError([
            'El horario no ha podido ser cargado.'
          ])
        }

        if((typeof response) == 'string'){
          self.courses = JSON.parse(response)
        }else{
          let newSchedule = this.convertOldObjToNewOjb(response)
          self.courses = newSchedule
        }


      })
    },
    // loadOldShedule(link){
    //   let self = this
    //   let data = {
    //     action: 7,
    //     id: link
    //   }
    //
    //   let formData = new FormData()
    //
    //   for (let n in data) {
    //     formData.append(n, data[n])
    //   }
    //
    //   fetch("https://horarios.coldideas.com/php/url.php",
    //   {
    //       body: formData,
    //       method: "post"
    //   }).then(res => {return res.json()})
    //   .catch(error => console.error('Error:', error))
    //   .then(response => {
    //     // self.courses = JSON.parse(response)
    //     let newSchedule = this.convertOldObjToNewOjb(response)
    //     console.log(response)
    //     console.log('newSchedule', newSchedule)
    //   })
    // },
    convertOldObjToNewOjb(old){
      if(useGoogle)
        ga('send', 'event', 'horario', 'convertir_version_antigua', 'tiempo', Math.floor(Date.now() / 1000) - this.initApp)
      let newObj = []
      let days = [
        'l',
        'k',
        'm',
        'j',
        'v',
        's',
        'd'
      ]

      for (var i = 0; i < old.length; i++) {
        for (var j = 0; j < old[i].length; j++) {
          let val = old[i][j]
          let hour = i + 7
          let course
          if(val.trim() != ''){
            for (var k = 0; k < newObj.length; k++) {
              if(newObj[k].name == val){
                course = newObj[k]
              }
            }
            if(course == null){
              course = {
                color: this.color,
                name: val,
                times: []
              }
              newObj.push(course)
            }

            course.times.push({
              day: days[j],
              init: ((hour<10)?'0'+hour:hour) + ':00',
              end: ((hour<10)?'0'+hour:hour) + ':50',
            })

            this.compressHours(course)
          }
        }
      }

      return newObj
    }
  },
  computed: {
    firstHourComputed(){
      if(this.init == -1){
        return this.config.firstHour
      }else{
        return this.init + this.config.firstHour
      }
    },
    table(){
      let table = []
      for (let i = 0; i < (this.config.lastHour - this.config.firstHour + 1); i++) {
        let row = table[i] = []
        for (let j = 0; j < Object.keys(this.days).length; j++) {
          table[i][j] = {
            text:''
          }
        }
      }
      for (let course of this.courses) {
        for (let time of course.times) {
          let col = this.letterDayToCol(time.day)
          let initRow = this.hourToRow(time.init)
          let endRow = this.hourToRow(time.end) + 1
          for (var i = initRow; i < endRow; i++) {
            table[i][col] = {
              text: course.name,
              ref: course,
              day: time.day,
              init: i == initRow,
              length: endRow - initRow
            }
          }
        }
      }
      return table
    },
    initHours(){
      let list = []
      for (let i = this.config.firstHour; i <= this.config.lastHour; i++) {
        list.push(this.n(i) + ":00")
      }
      return list
    },
    endHours(){
      let list = []
      for (let i = this.firstHourComputed; i <= this.config.lastHour; i++) {
        list.push(this.n(i) + ":50")
      }
      return list
    },
    datalistCoursesName(){
      let list = []
      let complement = [
        "Artistica",
        "Deportiva",
        "Matemáticas",
        "Humanidades I",
        "Humanidades II",
        "Laboratorio",
        "Repertorio"
      ]
      for (course of this.courses) {
        list.push(course.name)
      }

      list.reverse()

      for (course of complement) {
        if(!list.includes(course)){
          list.push(course)
        }
      }
      return list
    }
  },
  watch: {
    courses: {
      handler(val){
        if(this.updateLocalStorage){
          localStorage.setItem('courses', JSON.stringify(val))
        }
        this.updateLocalStorage = true

        // if(this.link != ''){
        //   location.hash = ''
        // }
      },
      deep: true
    },
    style(val){
      let el = this.$refs.gangham
      let audio = this.$refs.audio

      if(val){
        el.style.display = 'block'
        audio.currentTime = 3.5
        audio.play()
        this.generateRandomColors()
      }else{
        el.style.display = 'none'
        audio.pause()
        document.body.style.removeProperty('--primary')
        document.body.style.removeProperty('--secondary')
        document.body.style.removeProperty('--grey')
        document.body.style.removeProperty('--ligth-grey')
      }
    },
    lol(val){
      if(val){
        this.generateRandomColors()
      }else{
        document.body.style.removeProperty('--primary')
        document.body.style.removeProperty('--secondary')
        document.body.style.removeProperty('--grey')
        document.body.style.removeProperty('--ligth-grey')
      }
    },
    showGrid(){
      localStorage.setItem('showGrid', this.showGrid)
    },
    saved(val){
      localStorage.saved = val
    },
    yul(val){
      localStorage.yul = val
    },
    link(val, oldVal){
      let h = location.hash.replace("#","")
      if(h.trim() != ''){
        if(val != oldVal){
          this.loadShedule(val)
        }
      }else{
        this.courses = []
      }
    },
    dark(val){
      if(val){
        document.body.classList.add('dark-theme')
      }else{
        document.body.classList.remove('dark-theme')
      }
      localStorage.dark = val
    },
    modals: {
      handler(val){
        let important = [
          'colab',
          'help',
          'dev',
          'terms',
          'gifts',
          'law'
        ]
        for(let modal in val){
          if(val[modal] && important.indexOf(modal) >= 0){
            if(useGoogle)
              ga('send', 'event', 'informacion_modal', modal, 'tiempo', Math.floor(Date.now() / 1000) - this.initApp)
          }
        }
      },
      deep: true
    },
    colorEditor(val){
      localStorage.colorEditor = val
    },
    name(val, old){
      if(val.toLowerCase() == 'style'){
        this.style = true
        if(useGoogle)
            ga('send', 'event', 'comando_secreto', 'style', 'tiempo', Math.floor(Date.now() / 1000) - this.initApp)
      }

      if(old.toLowerCase() == 'style'){
        this.style = false
      }
    }
  },
  mounted(){
    this.initApp = sessionStorage.init = Math.floor(Date.now() / 1000)

    let c = localStorage.getItem('courses')
    if(c != null){
      this.courses = JSON.parse(c)
    }

    this.saved = localStorage.saved == 'true'
    this.yul = localStorage.yul == 'true'

    if(this.yul == false){
      this.hideCommand = 'fb.com/yuliavilaart'
      this.executeHideCommand()
    }

    let g = localStorage.getItem('showGrid')
    if(g != null){
      this.showGrid = g == 'true'
    }

    document.onkeyup = function(e) {
      if (e.ctrlKey && e.which == 77) {
        e.preventDefault()
        window.scrollTo(0,document.body.scrollHeight)
        app.$refs.hideCommand.focus()
      }
    }

    document.addEventListener('click', e =>{
      if(app.style){
        app.style = false
      }
      if(app.lol){
        app.lol = false
      }
      if(e.target.id == 'menu-toggle'){
        if(document.getElementById('menu').classList.contains('menu-open')){
          document.getElementById('menu').classList.remove('menu-open')
          document.body.style.overflow = 'auto'
        }else{
          window.scrollTo(0,0)
          document.body.style.overflow = 'hidden'
          document.getElementById('menu').classList.add('menu-open')
        }
      }
    })

    this.$on('closeModals', e=>{
      for (modal in this.modals) {
        this.modals[modal] = false
      }
    })

    window.addEventListener('storage', function (e) {
      if(e.key == 'courses'){
        app.updateLocalStorage = false
        app.courses = JSON.parse(e.newValue)
      }
    })

    window.onhashchange = e =>{
      let h = location.hash.replace("#","")
      if(h.trim() != null){
        app.link = h
        app.saved = true
      }else{
        app.link = ''
        app.saved = false
      }

    }
    this.link = location.hash.replace("#","")
    this.saved = true

    this.dark = localStorage.dark == 'true'

    this.colorEditor = localStorage.colorEditor == 'true'
    
    if(this.colorEditor == false){
      this.hideCommand = 'colored'
      this.executeHideCommand()
    }
  }
})
